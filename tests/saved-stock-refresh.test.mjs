import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import "tsx/cjs";
const require = createRequire(import.meta.url);
const { runPriceJob } = require("../src/lib/price-job.ts");
const { getWatchlistListings } = require("../src/lib/listing-detail.ts");
const now = new Date("2026-10-14T15:00:00Z");
const settled = new Date("2026-10-13T21:00:00Z");
const listing = (symbol, extra = {}) => ({ symbol, name: symbol, currency: "USD", price: 10, changeAbs: 1, changePct: 1, logoUrl: null, logoCheckedAt: now, priceFetchedAt: null, closes: [["2025-10-01", 8], ["2026-10-12", 9]], closesFetchedAt: settled, ...extra });

function fixture(listings, tickers, instrument = []) {
  const usage = new Map();
  const writes = [];
  const db = {
    jobState: { findUnique: async () => ({ ranAt: now }) },
    savedWatchlist: { findMany: async () => tickers.map(tickers => ({ state: { tickers } })) },
    listing: {
      findMany: async ({ where }) => where.cik ? [] : listings.filter(row => where.symbol.in.includes(row.symbol)),
      update: async ({ where, data }) => { writes.push({ ticker: where.symbol, data }); Object.assign(listings.find(row => row.symbol === where.symbol), data); },
    },
    instrument: { findMany: async ({ select }) => select.closes ? instrument : [], updateMany: async () => {} },
    quote: { upsert: async ({ where, update }) => writes.push({ ticker: where.ticker, data: update }) },
    dailyClose: { findMany: async () => [], createMany: async () => {} },
    snapshot: { upsert: async () => {} },
    apiUsage: {
      deleteMany: async () => {},
      upsert: async ({ where, create, update }) => { const credits = usage.has(where.bucket) ? usage.get(where.bucket) + update.credits.increment : create.credits; usage.set(where.bucket, credits); return { credits }; },
    },
  };
  return { db, writes, usage };
}
function provider(t, response) {
  t.mock.method(globalThis, "fetch", async url => {
    const request = new URL(url);
    assert.equal(request.hostname, "api.twelvedata.com");
    const symbols = request.searchParams.get("symbol").split(",");
    const rows = Object.fromEntries(symbols.map(symbol => [symbol, response(request, symbol)]));
    return Response.json(symbols.length === 1 ? rows[symbols[0]] : rows);
  });
  const key = process.env.TWELVE_DATA_API_KEY;
  process.env.TWELVE_DATA_API_KEY = "test-only";
  t.after(() => { if (key === undefined) delete process.env.TWELVE_DATA_API_KEY; else process.env.TWELVE_DATA_API_KEY = key; });
}

test("watchlist reads stored listings without provider requests or writes", async t => {
  const { db, writes, usage } = fixture([listing("DUOL", { closesFetchedAt: null })], []);
  provider(t, () => { assert.fail("watchlist must not call the provider"); });
  const rows = await getWatchlistListings(db, ["DUOL"]);
  assert.equal(rows[0].price, 9);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
  assert.deepEqual(writes, []);
  assert.equal(usage.size, 0);
});

test("saved listings join tracked quotes in one oldest-first six-credit rotation", async t => {
  const listings = Array.from({ length: 8 }, (_, i) => listing(`NEW${i}`));
  const tracked = { ticker: "AAPL", closesCheckedAt: settled, closes: [{ date: new Date("2026-10-13") }], quote: { fetchedAt: new Date("2026-10-14T13:00:00Z") } };
  const { db, writes, usage } = fixture(listings, [[...listings.map(row => row.symbol), "AAPL", "NEW0", "invalid ticker"], ["NEW0"]], [tracked]);
  provider(t, request => { assert.equal(request.pathname, "/quote"); return { close: "20", change: "2", percent_change: "10", timestamp: now.getTime() / 1000 }; });
  const report = await runPriceJob(db, now);
  assert.deepEqual(report.quotes, listings.slice(0, 6).map(row => row.symbol));
  assert.equal(writes.length, 6);
  assert.ok(writes.every(write => write.data.priceFetchedAt === now));
  assert.equal(usage.get("m:2026-10-14T15:00"), 6);
});

test("scheduled close top-ups preserve history, discard today's unfinished bar, and keep old data on empty responses", async t => {
  const listings = [listing("DUOL", { closesFetchedAt: null, priceFetchedAt: now }), listing("EMPTY", { closesFetchedAt: null, priceFetchedAt: now })];
  const original = structuredClone(listings[1].closes);
  const { db } = fixture(listings, [["DUOL", "EMPTY"]]);
  provider(t, (request, symbol) => {
    assert.equal(request.pathname, "/time_series");
    return { values: symbol === "EMPTY" ? [] : [{ datetime: "2026-10-14", close: "99" }, { datetime: "2026-10-13", close: "12" }] };
  });
  const report = await runPriceJob(db, now);
  assert.deepEqual(report.closes, ["DUOL", "EMPTY"]);
  assert.deepEqual(listings[0].closes, [["2025-10-01", 8], ["2026-10-12", 9], ["2026-10-13", 12]]);
  assert.deepEqual(listings[1].closes, original);
  assert.equal(listings[1].closesFetchedAt, now);
});

test("unsaved and invalid symbols never enter the scheduled provider batch", async t => {
  const { db, writes } = fixture([listing("UNSAVED"), listing("invalid ticker")], [["invalid ticker", "MISSING"], null]);
  provider(t, () => { assert.fail("no existing saved listing is eligible"); });
  const report = await runPriceJob(db, now);
  assert.deepEqual(report.quotes, []);
  assert.deepEqual(report.closes, []);
  assert.deepEqual(writes, []);
});
