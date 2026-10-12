import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { priceHealth } = await import("../src/lib/price-health.ts");

// 2026-10-01 is a Thursday; New York is on EDT (UTC−4), so the market is open 13:30–20:00 UTC.
const at = iso => new Date(iso);
const state = (ticker, fields = {}) => ({ ticker, latestClose: "2026-09-30", closesCheckedAt: at("2026-10-01T00:00:00Z"), quoteFetchedAt: null, ...fields });

test("a fresh rotation during market hours is healthy", () => {
  const now = at("2026-10-01T17:00:00Z");
  const health = priceHealth({ now, lastSuccess: at("2026-10-01T16:57:00Z"), lastFailure: null, states: [
    state("AAPL", { quoteFetchedAt: at("2026-10-01T16:10:00Z") }),
    state("MSFT", { quoteFetchedAt: at("2026-10-01T15:00:00Z") }),
  ] });
  assert.equal(health.healthy, true);
  assert.deepEqual(health.problems, []);
});

test("quotes from before the bell aren't overdue until well into the session", () => {
  const states = [state("AAPL", { quoteFetchedAt: at("2026-09-30T20:30:00Z") })];
  const lastSuccess = at("2026-10-01T14:55:00Z");
  assert.deepEqual(priceHealth({ now: at("2026-10-01T15:00:00Z"), lastSuccess, lastFailure: null, states }).staleQuotes, []);
  assert.deepEqual(priceHealth({ now: at("2026-10-01T16:05:00Z"), lastSuccess: at("2026-10-01T16:00:00Z"), lastFailure: null, states }).staleQuotes, ["AAPL"]);
});

test("a job that stopped succeeding is unhealthy even when prices look recent", () => {
  const health = priceHealth({ now: at("2026-10-01T17:00:00Z"), lastSuccess: at("2026-10-01T16:00:00Z"), lastFailure: at("2026-10-01T16:55:00Z"), states: [] });
  assert.equal(health.healthy, false);
  assert.match(health.problems[0], /60 minutes ago/);
  assert.equal(health.lastFailureAt, "2026-10-01T16:55:00.000Z");
  assert.equal(priceHealth({ now: at("2026-10-01T17:00:00Z"), lastSuccess: null, lastFailure: null, states: [] }).healthy, false);
});

test("after the close, the final quotes and closes must arrive within the catch-up window", () => {
  // Thursday's session settles at 20:15 UTC.
  const states = [state("AAPL", { quoteFetchedAt: at("2026-10-01T19:55:00Z"), closesCheckedAt: at("2026-10-01T00:00:00Z") })];
  const early = priceHealth({ now: at("2026-10-01T22:00:00Z"), lastSuccess: at("2026-10-01T21:58:00Z"), lastFailure: null, states });
  assert.equal(early.healthy, true);
  const late = priceHealth({ now: at("2026-10-02T00:00:00Z"), lastSuccess: at("2026-10-01T23:58:00Z"), lastFailure: null, states });
  assert.deepEqual(late.staleQuotes, ["AAPL"]);
  assert.deepEqual(late.staleCloses, ["AAPL"]);
  const done = priceHealth({ now: at("2026-10-02T00:00:00Z"), lastSuccess: at("2026-10-01T23:58:00Z"), lastFailure: null, states: [state("AAPL", { quoteFetchedAt: at("2026-10-01T20:20:00Z"), closesCheckedAt: at("2026-10-01T20:20:00Z") })] });
  assert.equal(done.healthy, true);
});

test("a weekend is quiet once Friday's session is in", () => {
  const states = [state("AAPL", { quoteFetchedAt: at("2026-10-02T20:20:00Z"), closesCheckedAt: at("2026-10-02T20:20:00Z") })];
  assert.equal(priceHealth({ now: at("2026-10-04T12:00:00Z"), lastSuccess: at("2026-10-04T11:57:00Z"), lastFailure: null, states }).healthy, true);
});
