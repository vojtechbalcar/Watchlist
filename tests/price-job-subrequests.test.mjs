import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import "tsx/cjs";

const require = createRequire(import.meta.url);
const { runPriceJob } = require("../src/lib/price-job.ts");

test("a metadata backlog leaves room for prices and outcome recording within 50 subrequests", async t => {
  const now = new Date("2026-10-17T10:37:00Z");
  let requests = 0;
  const request = () => assert.ok(++requests <= 48, "price work must leave two requests for outcome recording");
  const query = fn => async (...args) => { request(); return fn(...args); };
  const instruments = Array.from({ length: 60 }, (_, i) => ({ ticker: `STOCK${i}`, name: `Stock ${i}`, sector: "Technology", closesCheckedAt: null, quote: null }));
  const listings = Array.from({ length: 6400 }, (_, i) => ({ symbol: `STOCK${i}`, name: `Stock ${i}`, exchange: "NASDAQ", type: "Common Stock", currency: "USD" }));
  const usage = new Map();
  const db = {
    jobState: { findUnique: query(() => null), upsert: query(() => ({})) },
    listing: {
      findMany: query(({ where, take } = {}) => where?.cik
        ? Array.from({ length: take }, (_, i) => ({ cik: i + 1 }))
        : listings),
      // Over the Prisma Postgres driver's 16,384 bind values, Prisma splits the insert into a
      // transaction, which needs a WebSocket the deployed Worker loses (2026-10-18 outage).
      createMany: query(({ data }) => {
        assert.ok(data.length * Object.keys(data[0]).length <= 16384, `${data.length} listings fit one statement`);
        return {};
      }),
    },
    savedWatchlist: { findMany: query(() => []) },
    instrument: { findMany: query(() => instruments), updateMany: query(() => ({})) },
    dailyClose: { groupBy: query(() => []), createMany: query(() => ({})) },
    quote: { upsert: query(() => ({})) },
    snapshot: { upsert: query(() => ({})) },
    $executeRaw: query(() => 6400),
    $queryRaw: query(() => []),
    apiUsage: {
      deleteMany: query(() => ({})),
      upsert: query(({ where, create, update }) => {
        const credits = usage.has(where.bucket) ? usage.get(where.bucket) + update.credits.increment : create.credits;
        usage.set(where.bucket, credits);
        return { credits };
      }),
    },
  };
  const key = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "test-only";
  t.after(() => { if (key === undefined) delete process.env.TWELVE_DATA_API_KEY; else process.env.TWELVE_DATA_API_KEY = key; });
  const timeout = globalThis.setTimeout;
  t.mock.method(globalThis, "setTimeout", (callback, _delay, ...args) => timeout(callback, 0, ...args));
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async url => {
    request();
    const parsed = new URL(url);
    if (parsed.hostname === "www.sec.gov") return Response.json({ fields: ["cik", "ticker"], data: listings.map((row, i) => [i + 1, row.symbol]) });
    if (parsed.hostname === "data.sec.gov") return Response.json({ sic: "7372" });
    assert.equal(parsed.hostname, "api.twelvedata.com");
    if (parsed.pathname === "/stocks") return Response.json({ data: listings });
    assert.equal(parsed.pathname, "/time_series");
    return Response.json(Object.fromEntries(parsed.searchParams.get("symbol").split(",").map(symbol => [symbol, { values: [{ datetime: "2026-10-16", close: "10" }] }])));
  });

  const report = await runPriceJob(db, now);
  assert.equal(report.closes.length, 5);
  assert.ok(requests <= 48);
  assert.equal(usage.get("m:2026-10-17T10:37"), 6, "listing sync and prices share the existing six-credit limit");
});
