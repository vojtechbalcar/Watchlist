import test from "node:test";
import assert from "node:assert/strict";
import { emptyWatchlist, parseWatchlist, validTickers, watchlistSummary } from "../src/lib/watchlist-state.ts";

const available = ["AAPL", "MSFT", "NVDA"];

test("new visitors and corrupt storage start with an empty watchlist", () => {
  for (const raw of [null, "", "{broken", "[]", "null", "true"]) {
    assert.deepEqual(parseWatchlist(raw, available), emptyWatchlist);
  }
});

test("membership keeps supported symbols once and preserves selection order", () => {
  const input = ["MSFT", null, "NVDA", "MSFT", "UNKNOWN", 12, {}, "AAPL"];
  assert.deepEqual(validTickers(input, available), ["MSFT", "NVDA", "AAPL"]);
  assert.equal(input.length, 8);
  assert.deepEqual(validTickers("AAPL", available), []);
});

test("skip and completion persist separately from membership", () => {
  assert.deepEqual(parseWatchlist(JSON.stringify({ tickers: [], setupDismissed: true }), available), {
    tickers: [], setupDismissed: true, setupCompleted: false,
  });
  assert.deepEqual(parseWatchlist(JSON.stringify({ tickers: [], setupCompleted: true }), available), {
    tickers: [], setupDismissed: false, setupCompleted: true,
  });
  assert.deepEqual(parseWatchlist(JSON.stringify({ tickers: ["NVDA"], setupCompleted: "true", setupDismissed: 1 }), available), {
    tickers: ["NVDA"], setupDismissed: false, setupCompleted: false,
  });
});

test("dashboard averages only selected stocks and distinguishes neutral returns", () => {
  const rows = [{ vsBenchmarkPct: 3 }, { vsBenchmarkPct: -6 }, { vsBenchmarkPct: 0 }];
  assert.deepEqual(watchlistSummary(rows, 10), { total: 3, beating: 1, behind: 1, leadPct: -1, watchlistPct: 9 });
  assert.deepEqual(watchlistSummary([], 10), { total: 0, beating: 0, behind: 0, leadPct: 0, watchlistPct: 0 });
  assert.deepEqual(watchlistSummary([{ vsBenchmarkPct: -15 }], 10), { total: 1, beating: 0, behind: 1, leadPct: -15, watchlistPct: -5 });
});
