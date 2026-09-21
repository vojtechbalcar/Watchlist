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
    tickers: [], setupDismissed: true, setupCompleted: false, setupDraft: null,
  });
  assert.deepEqual(parseWatchlist(JSON.stringify({ tickers: [], setupCompleted: true }), available), {
    tickers: [], setupDismissed: false, setupCompleted: true, setupDraft: null,
  });
  assert.deepEqual(parseWatchlist(JSON.stringify({ tickers: ["NVDA"], setupCompleted: "true", setupDismissed: 1 }), available), {
    tickers: ["NVDA"], setupDismissed: false, setupCompleted: false, setupDraft: null,
  });
});

test("dashboard averages only selected stocks and distinguishes neutral returns", () => {
  const rows = [{ vsBenchmarkPct: 3 }, { vsBenchmarkPct: -6 }, { vsBenchmarkPct: 0 }];
  assert.deepEqual(watchlistSummary(rows, 10), { total: 3, beating: 1, behind: 1, leadPct: -1, watchlistPct: 9 });
  assert.deepEqual(watchlistSummary([], 10), { total: 0, beating: 0, behind: 0, leadPct: 0, watchlistPct: 0 });
  assert.deepEqual(watchlistSummary([{ vsBenchmarkPct: -15 }], 10), { total: 1, beating: 0, behind: 1, leadPct: -15, watchlistPct: -5 });
});

test("setup drafts survive a round trip without adding stocks to membership", () => {
  for (const step of [0, 1, 2]) {
    const draft = { version: 1, step, interests: ["Technology"], selected: ["MSFT"] };
    const state = parseWatchlist(JSON.stringify({ tickers: ["NVDA"], setupDraft: draft }), available, ["Technology"]);
    assert.deepEqual(state.setupDraft, draft);
    assert.deepEqual(state.tickers, ["NVDA"]);
  }
});

test("invalid drafts do not discard valid saved membership", () => {
  for (const setupDraft of [null, {}, [], "draft", { version: 2, step: 1 }]) {
    const state = parseWatchlist(JSON.stringify({ tickers: ["AAPL"], setupCompleted: true, setupDraft }), available, ["Technology"]);
    assert.equal(state.setupDraft, null);
    assert.deepEqual(state.tickers, ["AAPL"]);
    assert.equal(state.setupCompleted, true);
  }
});

test("draft recovery filters unsupported choices and returns an empty review to stock selection", () => {
  const setupDraft = { version: 1, step: 2, interests: ["Technology", null, "Technology", "Unknown"], selected: ["UNKNOWN", 7] };
  const state = parseWatchlist(JSON.stringify({ setupDraft }), available, ["Technology"]);
  assert.deepEqual(state.setupDraft, { version: 1, step: 1, interests: ["Technology"], selected: [] });
  for (const step of [-1, 3, 1.5, "2", null]) {
    assert.equal(parseWatchlist(JSON.stringify({ setupDraft: { ...setupDraft, step, selected: ["NVDA", "NVDA"] } }), available, ["Technology"]).setupDraft.step, 0);
  }
});
