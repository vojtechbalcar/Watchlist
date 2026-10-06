import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { reconcileWatchlist } = await import("../src/lib/watchlist-sync.ts");
const { emptyWatchlist } = await import("../src/lib/watchlist-state.ts");

const list = tickers => ({ ...emptyWatchlist, tickers, setupCompleted: true });

test("the account's saved list replaces this browser's copy", () => {
  assert.deepEqual(reconcileWatchlist({ server: list(["MSFT"]), local: list(["AAPL"]), localOwner: "u1", userId: "u1", editedBeforeLoad: false }),
    { local: list(["MSFT"]), upload: null });
});

test("a list made before accounts existed moves into the first account that signs in", () => {
  assert.deepEqual(reconcileWatchlist({ server: null, local: list(["AAPL"]), localOwner: null, userId: "u1", editedBeforeLoad: false }),
    { local: list(["AAPL"]), upload: list(["AAPL"]) });
});

test("another account's copy in this browser is neither shown nor uploaded", () => {
  assert.deepEqual(reconcileWatchlist({ server: null, local: list(["AAPL"]), localOwner: "u2", userId: "u1", editedBeforeLoad: false }),
    { local: emptyWatchlist, upload: null });
  assert.deepEqual(reconcileWatchlist({ server: list(["MSFT"]), local: list(["AAPL"]), localOwner: "u2", userId: "u1", editedBeforeLoad: true }),
    { local: list(["MSFT"]), upload: null });
});

test("a change made while the account's list was loading wins", () => {
  assert.deepEqual(reconcileWatchlist({ server: list(["MSFT"]), local: list(["MSFT", "NVDA"]), localOwner: "u1", userId: "u1", editedBeforeLoad: true }),
    { local: list(["MSFT", "NVDA"]), upload: list(["MSFT", "NVDA"]) });
});

test("nothing anywhere stays empty without a request", () => {
  assert.deepEqual(reconcileWatchlist({ server: null, local: emptyWatchlist, localOwner: null, userId: "u1", editedBeforeLoad: false }),
    { local: emptyWatchlist, upload: null });
});

test("preferences follow the same rules, with defaults as the blank copy", async () => {
  const { reconcilePreferences } = await import("../src/lib/preferences.ts");
  const { defaultPreferences } = await import("../src/lib/preferences.ts");
  const compact = { ...defaultPreferences, density: "compact" };
  assert.deepEqual(reconcilePreferences({ server: null, local: defaultPreferences, localOwner: null, userId: "u1", editedBeforeLoad: false }), { local: defaultPreferences, upload: null });
  assert.deepEqual(reconcilePreferences({ server: null, local: compact, localOwner: null, userId: "u1", editedBeforeLoad: false }), { local: compact, upload: compact });
  assert.deepEqual(reconcilePreferences({ server: defaultPreferences, local: compact, localOwner: "u2", userId: "u1", editedBeforeLoad: false }), { local: defaultPreferences, upload: null });
});
