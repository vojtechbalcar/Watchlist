import assert from "node:assert/strict";
import test from "node:test";
import { BACKFILL_SESSIONS, TOPUP_SESSIONS, closesDue, isMarketOpen, latestSettledSession, nyClock, nyToUtc, quotesDue, sessionsToFetch, symbolSyncDue } from "../src/lib/price-schedule.ts";

// 2026-10-01 is a Thursday; New York is on EDT (UTC−4).
const at = iso => new Date(iso);
const state = (ticker, fields = {}) => ({ ticker, latestClose: null, closesCheckedAt: null, quoteFetchedAt: null, ...fields });

test("New York wall-clock conversion handles both EDT and EST", () => {
  assert.deepEqual(nyClock(at("2026-10-01T13:30:00Z")), { ymd: "2026-10-01", weekday: 4, minutes: 9 * 60 + 30 });
  assert.equal(nyToUtc("2026-10-01", 16 * 60).toISOString(), "2026-10-01T20:00:00.000Z");
  assert.equal(nyToUtc("2026-12-01", 16 * 60).toISOString(), "2026-12-01T21:00:00.000Z");
});

test("the market is open 9:30–16:00 New York time on weekdays", () => {
  assert.equal(isMarketOpen(at("2026-10-01T13:29:00Z")), false);
  assert.equal(isMarketOpen(at("2026-10-01T13:30:00Z")), true);
  assert.equal(isMarketOpen(at("2026-10-01T19:59:00Z")), true);
  assert.equal(isMarketOpen(at("2026-10-01T20:00:00Z")), false);
  assert.equal(isMarketOpen(at("2026-10-03T15:00:00Z")), false); // Saturday
});

test("the latest settled session skips today until 16:15 and skips weekends", () => {
  assert.equal(latestSettledSession(at("2026-10-01T20:14:00Z")).ymd, "2026-09-30");
  assert.equal(latestSettledSession(at("2026-10-01T20:15:00Z")).ymd, "2026-10-01");
  assert.equal(latestSettledSession(at("2026-10-05T12:00:00Z")).ymd, "2026-10-02"); // Monday morning → Friday
});

test("closes are due once per settled session, never-checked first", () => {
  const now = at("2026-10-01T21:00:00Z");
  const due = closesDue([
    state("DONE", { closesCheckedAt: at("2026-10-01T20:30:00Z") }),
    state("OLD", { closesCheckedAt: at("2026-09-30T21:00:00Z") }),
    state("NEW"),
  ], now);
  assert.deepEqual(due.map(row => row.ticker), ["NEW", "OLD"]);
});

test("backfill fetches a long history; later runs only top up", () => {
  assert.equal(sessionsToFetch(state("NEW")), BACKFILL_SESSIONS);
  assert.equal(sessionsToFetch(state("OLD", { latestClose: "2026-09-30" })), TOPUP_SESSIONS);
});

test("during market hours quotes are due after 50 minutes, stalest first", () => {
  const now = at("2026-10-01T15:00:00Z");
  const due = quotesDue([
    state("FRESH", { quoteFetchedAt: at("2026-10-01T14:20:00Z") }),
    state("STALE", { quoteFetchedAt: at("2026-10-01T14:10:00Z") }),
    state("STALER", { quoteFetchedAt: at("2026-10-01T13:00:00Z") }),
    state("NEVER"),
  ], now);
  assert.deepEqual(due.map(row => row.ticker), ["NEVER", "STALER", "STALE"]);
});

test("after the close each quote gets one final refresh", () => {
  const evening = at("2026-10-01T23:00:00Z");
  const states = [
    state("BEFORE", { quoteFetchedAt: at("2026-10-01T19:40:00Z") }),
    state("AFTER", { quoteFetchedAt: at("2026-10-01T20:20:00Z") }),
  ];
  assert.deepEqual(quotesDue(states, evening).map(row => row.ticker), ["BEFORE"]);
  // Over the weekend nothing is due once Friday's final refresh is in.
  assert.deepEqual(quotesDue([state("FRI", { quoteFetchedAt: at("2026-10-02T20:30:00Z") })], at("2026-10-04T12:00:00Z")), []);
});

test("the symbol list syncs about once a day", () => {
  const now = at("2026-10-01T12:00:00Z");
  assert.equal(symbolSyncDue(null, now), true);
  assert.equal(symbolSyncDue(at("2026-10-01T00:00:00Z"), now), false);
  assert.equal(symbolSyncDue(at("2026-09-30T15:00:00Z"), now), true);
});
