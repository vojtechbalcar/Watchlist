import assert from "node:assert/strict";
import test from "node:test";
import { BACKFILL_SESSIONS, TOPUP_SESSIONS, closesDue, isMarketOpen, marketHours, sessionOpenedBy, latestSettledSession, nyClock, nyToUtc, quotesDue, sessionsToFetch, symbolSyncDue } from "../src/lib/price-schedule.ts";

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

test("NYSE holidays have no session, including observed and moving dates", () => {
  const closed = [
    "2026-01-01", // New Year's Day
    "2026-01-19", // Martin Luther King Jr. Day, third Monday
    "2026-02-16", // Washington's Birthday, third Monday
    "2026-04-03", // Good Friday (Easter is April 5)
    "2026-05-25", // Memorial Day, last Monday
    "2026-06-19", // Juneteenth
    "2026-07-03", // Independence Day falls on a Saturday, observed Friday
    "2026-09-07", // Labor Day
    "2026-11-26", // Thanksgiving, fourth Thursday
    "2026-12-25", // Christmas
    "2027-03-26", // Good Friday (Easter is March 28)
    "2027-06-18", // Juneteenth falls on a Saturday, observed Friday
    "2027-12-24", // Christmas falls on a Saturday, observed Friday
    "2028-01-17", // MLK; New Year's Day 2028 is a Saturday and is not observed
  ];
  for (const ymd of closed) assert.equal(marketHours(ymd), null, ymd);
  assert.equal(marketHours("2027-12-31"), 16 * 60, "New Year's Eve 2027 trades normally");
  assert.deepEqual([marketHours("2026-10-01"), marketHours("2026-10-03")], [16 * 60, null]);
});

test("the market closes at 13:00 before Independence Day, after Thanksgiving, and on Christmas Eve", () => {
  assert.equal(marketHours("2026-11-27"), 13 * 60);
  assert.equal(marketHours("2026-12-24"), 13 * 60);
  assert.equal(marketHours("2025-07-03"), 13 * 60);
  assert.equal(marketHours("2026-07-02"), 16 * 60, "July 3 is the holiday itself in 2026");
  assert.equal(isMarketOpen(at("2026-11-27T17:59:00Z")), true);
  assert.equal(isMarketOpen(at("2026-11-27T18:00:00Z")), false);
});

test("holidays are skipped when finding the latest settled session", () => {
  assert.equal(isMarketOpen(at("2026-11-26T16:00:00Z")), false); // Thanksgiving, 11:00 New York
  assert.equal(latestSettledSession(at("2026-11-27T12:00:00Z")).ymd, "2026-11-25");
  assert.equal(latestSettledSession(at("2026-11-27T18:15:00Z")).ymd, "2026-11-27"); // early close settles at 13:15
  assert.equal(latestSettledSession(at("2026-09-08T12:00:00Z")).ymd, "2026-09-04"); // Tuesday after Labor Day
});

test("quotes aren't refreshed during a holiday's usual trading hours", () => {
  const now = at("2026-11-26T16:00:00Z");
  assert.deepEqual(quotesDue([state("SPY", { quoteFetchedAt: at("2026-11-25T21:30:00Z") })], now), []);
});

test("a quote belongs to the latest session that had opened when it was fetched", () => {
  assert.equal(sessionOpenedBy(at("2026-10-01T14:00:00Z")), "2026-10-01"); // during the session
  assert.equal(sessionOpenedBy(at("2026-10-01T20:05:00Z")), "2026-10-01"); // after the close, before it settles
  assert.equal(sessionOpenedBy(at("2026-10-01T12:00:00Z")), "2026-09-30"); // before the open
  assert.equal(sessionOpenedBy(at("2026-11-26T18:00:00Z")), "2026-11-25"); // Thanksgiving
  assert.equal(sessionOpenedBy(at("2026-10-04T15:00:00Z")), "2026-10-02"); // Sunday
});
