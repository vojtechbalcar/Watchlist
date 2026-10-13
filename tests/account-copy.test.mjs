import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { createAccountCopy } = await import("../src/lib/account-copy.ts");

const empty = { tickers: [] };
const list = (...tickers) => ({ tickers });

function fixture(initial = {}) {
  const data = new Map(Object.entries(initial));
  const requests = [];
  const timers = new Set();
  const events = { storage: new Set(), online: new Set() };
  let blockedRead = false;
  let blockedWrite = false;
  const storage = {
    getItem(key) { if (blockedRead) throw Error("Read blocked"); return data.get(key) ?? null; },
    setItem(key, value) { if (blockedWrite) throw Error("Write blocked"); data.set(key, value); },
    removeItem(key) { if (blockedWrite) throw Error("Write blocked"); data.delete(key); },
  };
  const copy = createAccountCopy({
    key: "copy", ownerKey: "owner", endpoint: "/copy", empty,
    parse: raw => raw ? JSON.parse(raw) : empty,
    reconcile: ({ server, local, localOwner, userId, editedBeforeLoad }) => {
      if (localOwner !== null && localOwner !== userId) return { local: server ?? empty, upload: null };
      if (server && !editedBeforeLoad) return { local: server, upload: null };
      return { local, upload: local.tickers.length ? local : null };
    },
  }, {
    storage: () => storage,
    fetch: (url, options) => new Promise(resolve => requests.push({ url, options, resolve })),
    subscribe: (event, listener) => { events[event].add(listener); return () => events[event].delete(listener); },
    schedule: task => { timers.add(task); return () => timers.delete(task); },
  });
  const answer = (index, state, ok = true) => requests[index].resolve({ ok, json: async () => ({ state }) });
  const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
  return {
    copy, data, requests, answer, flush,
    tick() { const due = [...timers]; timers.clear(); due.forEach(task => task()); },
    emit(event, key = null) { events[event].forEach(listener => listener(key)); },
    blockRead() { blockedRead = true; }, blockWrite() { blockedWrite = true; },
  };
}

test("snapshots stay stable until storage changes, and subscribers see writes and other tabs", () => {
  const f = fixture();
  const first = f.copy.getSnapshot();
  assert.equal(f.copy.getSnapshot(), first);
  let updates = 0;
  const unsubscribe = f.copy.subscribe(() => updates++);
  assert.equal(f.copy.update(() => list("AAPL")), true);
  assert.deepEqual(f.copy.getSnapshot(), list("AAPL"));
  assert.equal(updates, 1);
  f.data.set("copy", JSON.stringify(list("MSFT")));
  f.emit("storage", "unrelated");
  assert.equal(updates, 1);
  f.emit("storage", "copy");
  assert.deepEqual(f.copy.getSnapshot(), list("MSFT"));
  assert.equal(updates, 2);
  unsubscribe();
  f.emit("storage", "copy");
  assert.equal(updates, 2);
});

test("failed storage reads and writes do not replace a saved copy or report success", () => {
  for (const block of ["blockRead", "blockWrite"]) {
    const f = fixture({ copy: JSON.stringify(list("AAPL")) });
    f.copy.getSnapshot();
    f[block]();
    assert.equal(f.copy.update(() => list("MSFT")), false);
    assert.deepEqual(f.copy.getSnapshot(), list("AAPL"));
    assert.equal(f.data.get("copy"), JSON.stringify(list("AAPL")));
  }
});

test("a late load from a previous account cannot replace the current copy", async () => {
  const f = fixture();
  const a = f.copy.start("A");
  const b = f.copy.start("B");
  f.answer(1, list("MSFT"));
  await b;
  f.answer(0, list("AAPL"));
  await a;
  assert.deepEqual(f.copy.getSnapshot(), list("MSFT"));
  assert.equal(f.data.get("owner"), "B");
  assert.equal(f.copy.isSynced(), true);
});

test("switching accounts hides the previous copy even when browser writes are blocked", async () => {
  const f = fixture({ owner: "A", copy: JSON.stringify(list("AAPL")) });
  f.copy.getSnapshot();
  f.blockWrite();
  const load = f.copy.start("B");
  assert.deepEqual(f.copy.getSnapshot(), empty);
  f.answer(0, list("MSFT"));
  await load;
  assert.deepEqual(f.copy.getSnapshot(), list("MSFT"));
});

test("an edit during account loading wins and is uploaded", async () => {
  const f = fixture({ owner: "A", copy: JSON.stringify(list("AAPL")) });
  const load = f.copy.start("A");
  f.copy.update(() => list("AAPL", "NVDA"));
  assert.equal(f.data.get("owner:unsent"), "1");
  f.answer(0, list("MSFT"));
  await f.flush();
  assert.deepEqual(JSON.parse(f.requests[1].options.body), { state: list("AAPL", "NVDA") });
  f.answer(1, null);
  await load;
  assert.deepEqual(f.copy.getSnapshot(), list("AAPL", "NVDA"));
  assert.equal(f.data.has("owner:unsent"), false);
});

test("edits are durable before debounce, and uploads serialize the latest copy", async () => {
  const f = fixture({ owner: "A" });
  const load = f.copy.start("A");
  f.answer(0, empty); await load;
  f.copy.update(() => list("AAPL"));
  assert.equal(f.data.get("owner:unsent"), "1");
  assert.equal(f.requests.length, 1);
  f.tick();
  f.copy.update(() => list("MSFT"));
  f.tick();
  assert.equal(f.requests.length, 2, "the second upload waits for the first");
  f.answer(1, null); await f.flush();
  assert.equal(f.data.get("owner:unsent"), "1", "an old acknowledgement cannot clear a newer edit");
  assert.deepEqual(JSON.parse(f.requests[2].options.body), { state: list("MSFT") });
  f.answer(2, null); await f.flush();
  assert.equal(f.data.has("owner:unsent"), false);
});

test("an unsent copy survives reopening and outranks an older account copy", async () => {
  const f = fixture({ owner: "A", "owner:unsent": "1", copy: JSON.stringify(list("NVDA")) });
  const load = f.copy.start("A");
  f.answer(0, list("MSFT")); await f.flush();
  assert.deepEqual(f.copy.getSnapshot(), list("NVDA"));
  f.answer(1, null); await load;
  assert.equal(f.data.has("owner:unsent"), false);
});

test("failed uploads stay unsent and retry on reconnect without a retry loop", async () => {
  const f = fixture({ owner: "A" });
  const load = f.copy.start("A"); f.answer(0, empty); await load;
  f.copy.update(() => list("AAPL")); f.tick();
  f.answer(1, null, false); await f.flush();
  assert.equal(f.requests.length, 2);
  assert.equal(f.data.get("owner:unsent"), "1");
  f.emit("online");
  f.answer(2, null); await f.flush();
  assert.equal(f.data.has("owner:unsent"), false);
});

test("a pending debounce and old upload acknowledgement cannot cross accounts", async () => {
  const f = fixture({ owner: "A" });
  const a = f.copy.start("A"); f.answer(0, empty); await a;
  f.copy.update(() => list("AAPL")); f.tick();
  f.copy.update(() => list("NVDA"));
  const b = f.copy.start("B");
  f.tick();
  assert.equal(f.requests.length, 3, "old debounce was cancelled");
  f.answer(2, empty); await b;
  f.copy.update(() => list("MSFT"));
  f.answer(1, null); await f.flush();
  assert.equal(f.data.get("owner:unsent"), "1");
  assert.deepEqual(f.copy.getSnapshot(), list("MSFT"));
});

test("reset removes the storage key and syncs an empty copy", async () => {
  const f = fixture({ owner: "A", copy: JSON.stringify(list("AAPL")) });
  const load = f.copy.start("A"); f.answer(0, list("AAPL")); await load;
  assert.equal(f.copy.reset(), true);
  assert.equal(f.data.has("copy"), false);
  assert.deepEqual(f.copy.getSnapshot(), empty);
  f.tick();
  assert.deepEqual(JSON.parse(f.requests[1].options.body), { state: empty });
  f.answer(1, null); await f.flush();
});

test("a copy made before accounts migrates once; untouched defaults send nothing", async () => {
  for (const state of [empty, list("AAPL")]) {
    const f = fixture({ copy: JSON.stringify(state) });
    const load = f.copy.start("A");
    assert.equal(f.copy.start("A"), load, "the same account shares its pending load");
    f.answer(0, null); await f.flush();
    if (state.tickers.length) {
      assert.deepEqual(JSON.parse(f.requests[1].options.body), { state });
      f.answer(1, null);
    } else assert.equal(f.requests.length, 1);
    await load;
    assert.equal(f.data.get("owner"), "A");
  }
});

test("a reset made while loading still uploads an empty copy", async () => {
  const f = fixture({ owner: "A", copy: JSON.stringify(list("AAPL")) });
  const load = f.copy.start("A");
  f.copy.reset();
  f.answer(0, list("MSFT")); await f.flush();
  assert.deepEqual(JSON.parse(f.requests[1].options.body), { state: empty });
  f.answer(1, null); await load;
  assert.deepEqual(f.copy.getSnapshot(), empty);
});

test("a failed load falls back only to this account's browser copy", async () => {
  for (const owner of ["A", "B"]) {
    const f = fixture({ owner, copy: JSON.stringify(list("AAPL")) });
    const load = f.copy.start("A"); f.answer(0, null, false); await load;
    assert.deepEqual(f.copy.getSnapshot(), owner === "A" ? list("AAPL") : empty);
    assert.equal(f.copy.isSynced(), true);
    assert.equal(f.requests.length, 1);
  }
});

test("unreadable ownership never exposes a previous account's cached copy", async () => {
  const f = fixture({ owner: "A", copy: JSON.stringify(list("AAPL")) });
  f.copy.getSnapshot();
  f.blockRead();
  const load = f.copy.start("B"); f.answer(0, null, false); await load;
  assert.deepEqual(f.copy.getSnapshot(), empty);
  assert.equal(f.data.get("copy"), JSON.stringify(list("AAPL")), "unknown ownership must not erase the stored copy");
});

test("an edit from another tab while loading outranks the pending account response", async () => {
  const f = fixture({ owner: "A", copy: JSON.stringify(list("AAPL")) });
  f.copy.subscribe(() => {});
  const load = f.copy.start("A");
  f.data.set("copy", JSON.stringify(list("NVDA")));
  f.data.set("owner:unsent", "1");
  f.emit("storage", "copy");
  f.answer(0, list("MSFT")); await f.flush();
  assert.deepEqual(f.copy.getSnapshot(), list("NVDA"));
  f.answer(1, null); await load;
});

test("an edit during first sign-in retains its ownership if the page closes before loading", async () => {
  const first = fixture();
  const abandoned = first.copy.start("A");
  first.copy.update(() => list("NVDA"));
  const reopened = fixture(Object.fromEntries(first.data));
  const load = reopened.copy.start("A");
  reopened.answer(0, list("MSFT")); await reopened.flush();
  assert.deepEqual(reopened.copy.getSnapshot(), list("NVDA"));
  reopened.answer(1, null); await load;
  first.answer(0, null, false); await abandoned;
});

test("another tab's account switch is not overwritten by a successful or failed pending load", async () => {
  for (const ok of [true, false]) {
    const f = fixture({ owner: "A", copy: JSON.stringify(list("AAPL")) });
    const load = f.copy.start("A");
    f.data.set("owner", "B");
    f.data.set("copy", JSON.stringify(list("NVDA")));
    f.emit("storage", "owner");
    f.answer(0, list("MSFT"), ok); await load;
    assert.equal(f.data.get("owner"), "B");
    assert.equal(f.data.get("copy"), JSON.stringify(list("NVDA")));
    assert.deepEqual(f.copy.getSnapshot(), empty);
  }
});

test("reset cannot delete a copy another account owns", async () => {
  const f = fixture({ owner: "A" });
  const load = f.copy.start("A"); f.answer(0, empty); await load;
  f.data.set("owner", "B"); f.data.set("copy", JSON.stringify(list("NVDA")));
  f.emit("storage", "owner");
  assert.equal(f.copy.reset(), false);
  assert.equal(f.data.get("copy"), JSON.stringify(list("NVDA")));
});

test("a queued upload stops if another tab changes the account owner", async () => {
  const f = fixture({ owner: "A" });
  const load = f.copy.start("A"); f.answer(0, empty); await load;
  f.copy.update(() => list("AAPL")); f.tick();
  f.copy.update(() => list("MSFT"));
  f.data.set("owner", "B"); f.data.set("copy", JSON.stringify(list("NVDA")));
  f.emit("storage", "owner");
  f.answer(1, null); await f.flush();
  assert.equal(f.requests.length, 2, "no queued request follows the ownership change");
  assert.equal(f.data.get("copy"), JSON.stringify(list("NVDA")));
});
