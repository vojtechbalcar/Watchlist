import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { writeWatchlistStorage } = await import("../src/lib/watchlist-storage.ts");
const { completeSetupState, emptySetupDraft, removeTickerState, restoreTickerState, WATCHLIST_KEY } = await import("../src/lib/watchlist-state.ts");

function fixture() {
  const record = { raw: JSON.stringify({ tickers: ["NVDA"], setupDismissed: true, setupCompleted: false,
    setupDraft: { version: 1, step: 2, interests: ["Technology"], selected: ["MSFT"] } }), failRead: false, failWrite: false, writes: 0 };
  const storage = {
    getItem(key) { assert.equal(key, WATCHLIST_KEY); if (record.failRead) throw Error("Read blocked"); return record.raw; },
    setItem(key, value) { assert.equal(key, WATCHLIST_KEY); if (record.failWrite) throw Error("Quota exceeded"); record.raw = value; record.writes++; },
  };
  return { record, storage };
}
const finish = state => completeSetupState(state, ["MSFT", "NVDA", "UNKNOWN"], ["MSFT", "NVDA"]);

test("completion merges current membership and clears the draft in one write", () => {
  const { record, storage } = fixture();
  assert.equal(writeWatchlistStorage(storage, finish), true);
  assert.equal(record.writes, 1);
  assert.deepEqual(JSON.parse(record.raw), { tickers: ["NVDA", "MSFT"], setupDismissed: false, setupCompleted: true, setupDraft: null });
});

test("a failed completion preserves both membership and draft until retry succeeds", () => {
  const { record, storage } = fixture();
  const before = record.raw;
  record.failWrite = true;
  assert.equal(writeWatchlistStorage(storage, finish), false);
  assert.equal(record.raw, before);
  record.failWrite = false;
  assert.equal(writeWatchlistStorage(storage, finish), true);
  assert.equal(JSON.parse(record.raw).setupDraft, null);
});

test("a failed read never overwrites saved data using a fallback state", () => {
  const { record, storage } = fixture();
  const before = record.raw;
  record.failRead = true;
  assert.equal(writeWatchlistStorage(storage, finish), false);
  assert.equal(record.writes, 0);
  assert.equal(record.raw, before);
});

test("completion with no valid stocks leaves the draft intact", () => {
  const { record, storage } = fixture();
  const before = record.raw;
  assert.equal(writeWatchlistStorage(storage, state => completeSetupState(state, ["UNKNOWN"], ["MSFT"])), false);
  assert.equal(record.writes, 0);
  assert.equal(record.raw, before);
});

test("draft edits and restarts preserve saved stocks and skip keeps the draft", () => {
  const { record, storage } = fixture();
  assert.equal(writeWatchlistStorage(storage, state => ({ ...state, setupDismissed: true })), true);
  assert.equal(JSON.parse(record.raw).setupDraft.step, 2);
  assert.equal(writeWatchlistStorage(storage, state => ({ ...state, setupDraft: emptySetupDraft, setupDismissed: false })), true);
  assert.deepEqual(JSON.parse(record.raw).tickers, ["NVDA"]);
  assert.deepEqual(JSON.parse(record.raw).setupDraft, emptySetupDraft);
});

test("removal and undo write through storage and keep the freed position", () => {
  const { record, storage } = fixture();
  record.raw = JSON.stringify({ tickers: ["AAPL", "MSFT", "NVDA"], setupDismissed: false, setupCompleted: true, setupDraft: null });
  let freed = -1;
  assert.equal(writeWatchlistStorage(storage, state => {
    const result = removeTickerState(state, "MSFT");
    if (!result) return null;
    freed = result.index;
    return result.state;
  }), true);
  assert.equal(freed, 1);
  assert.deepEqual(JSON.parse(record.raw).tickers, ["AAPL", "NVDA"]);
  assert.equal(writeWatchlistStorage(storage, state => restoreTickerState(state, "MSFT", freed, ["AAPL", "MSFT", "NVDA"])), true);
  assert.deepEqual(JSON.parse(record.raw).tickers, ["AAPL", "MSFT", "NVDA"]);
});

test("a failed undo leaves the stock removed rather than claiming it came back", () => {
  const { record, storage } = fixture();
  record.raw = JSON.stringify({ tickers: ["AAPL"], setupDismissed: false, setupCompleted: true, setupDraft: null });
  record.failWrite = true;
  assert.equal(writeWatchlistStorage(storage, state => restoreTickerState(state, "MSFT", 0, ["AAPL", "MSFT"])), false);
  assert.deepEqual(JSON.parse(record.raw).tickers, ["AAPL"]);
  record.failWrite = false;
  assert.equal(writeWatchlistStorage(storage, state => restoreTickerState(state, "MSFT", 0, ["AAPL", "MSFT"])), true);
  assert.deepEqual(JSON.parse(record.raw).tickers, ["MSFT", "AAPL"]);
});

test("removal leaves the setup draft and skip state untouched", () => {
  const { record, storage } = fixture();
  assert.equal(writeWatchlistStorage(storage, state => removeTickerState(state, "NVDA")?.state ?? null), true);
  const saved = JSON.parse(record.raw);
  assert.deepEqual(saved.tickers, []);
  assert.equal(saved.setupDismissed, true);
  assert.deepEqual(saved.setupDraft, { version: 1, step: 2, interests: ["Technology"], selected: ["MSFT"] });
});

test("removing or restoring an unsupported stock never writes", () => {
  const { record, storage } = fixture();
  const before = record.raw;
  assert.equal(writeWatchlistStorage(storage, state => removeTickerState(state, "MSFT")?.state ?? null), false);
  assert.equal(writeWatchlistStorage(storage, state => restoreTickerState(state, "UNKNOWN", 0, ["MSFT", "NVDA"])), false);
  assert.equal(record.writes, 0);
  assert.equal(record.raw, before);
});
