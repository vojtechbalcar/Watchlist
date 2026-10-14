import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { createQuoteCache } = await import("../src/lib/quote-cache.ts");
const quote = price => ({ price, changePct: 1, currency: "USD", logoUrl: null });

function fixture() {
  let now = 1000;
  const requests = [];
  const cache = createQuoteCache({
    now: () => now,
    fetchQuotes: (symbols, live) => new Promise((resolve, reject) => requests.push({ symbols, live, resolve, reject })),
  });
  return {
    cache, requests,
    advance: ms => { now += ms; },
    answer: (index, quotes) => requests[index].resolve(quotes),
    flush: async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); },
  };
}

test("concurrent consumers share pending symbols and all subscribers get the result", async () => {
  const f = fixture();
  let a = 0, b = 0;
  const stopA = f.cache.subscribe(() => a++);
  f.cache.subscribe(() => b++);
  assert.equal(f.cache.quoteOf("AAPL"), undefined);
  const first = f.cache.load(["AAPL"], true);
  const second = f.cache.load(["AAPL"], true);
  await f.flush();
  assert.equal(f.requests.length, 1);
  stopA();
  f.answer(0, { AAPL: quote(100) });
  await Promise.all([first, second]);
  assert.deepEqual(f.cache.quoteOf("AAPL"), quote(100));
  assert.equal(a, 0, "leaving does not cancel another consumer's request");
  assert.equal(b, 1);
});

test("a late stored response cannot replace a live response or its freshness", async () => {
  const f = fixture();
  const stored = f.cache.load(["AAPL"], false);
  const live = f.cache.load(["AAPL"], true);
  await f.flush();
  f.answer(1, { AAPL: quote(120) }); await live;
  f.answer(0, { AAPL: quote(100) }); await stored;
  assert.deepEqual(f.cache.quoteOf("AAPL"), quote(120));
  await f.cache.load(["AAPL"], true);
  assert.equal(f.requests.length, 2);
});

test("a stored consumer joins a pending live request", async () => {
  const f = fixture();
  const live = f.cache.load(["AAPL"], true);
  const stored = f.cache.load(["AAPL"], false);
  await f.flush(); assert.equal(f.requests.length, 1);
  f.answer(0, { AAPL: quote(100) });
  await Promise.all([stored, live]);
});

test("stored data cannot satisfy a live lookup; freshness expires per mode", async () => {
  const f = fixture();
  const stored = f.cache.load(["AAPL"], false); await f.flush();
  f.answer(0, { AAPL: quote(100) }); await stored;
  const live = f.cache.load(["AAPL"], true); await f.flush();
  assert.equal(f.requests[1].live, true);
  f.answer(1, { AAPL: quote(120) }); await live;
  f.advance(60_000);
  const refresh = f.cache.load(["AAPL"], true); await f.flush();
  f.answer(2, { AAPL: quote(130) }); await refresh;
  f.advance(60_000);
  await f.cache.load(["AAPL"], false);
  assert.equal(f.requests.length, 3, "stored reads reuse live data for five minutes");
  f.advance(240_000);
  const expired = f.cache.load(["AAPL"], false); await f.flush();
  f.answer(3, { AAPL: quote(140) }); await expired;
  assert.deepEqual(f.cache.quoteOf("AAPL"), quote(140));
});

test("overlapping batches request only symbols that are still missing", async () => {
  const f = fixture();
  const first = f.cache.load(["AAPL", "MSFT"], false);
  const second = f.cache.load(["MSFT", "NVDA", "NVDA"], false);
  await f.flush();
  assert.deepEqual(f.requests.map(request => request.symbols), [["AAPL", "MSFT"], ["NVDA"]]);
  f.answer(0, { AAPL: quote(100), MSFT: quote(200) });
  f.answer(1, { NVDA: quote(300) });
  await Promise.all([first, second]);
});

test("live lookups cap the visible selection before filtering cached symbols", async () => {
  const f = fixture();
  const symbols = ["A", "B", "C", "D", "E", "F", "G"];
  const load = f.cache.load(symbols, true); await f.flush();
  assert.deepEqual(f.requests[0].symbols, symbols.slice(0, 6));
  f.answer(0, {}); await load;
  await f.cache.load(symbols, true);
  assert.equal(f.requests.length, 1, "a seventh result never spends live credits");
  assert.equal(f.cache.quoteOf("A"), null);
  assert.equal(f.cache.quoteOf("G"), undefined);
});

test("stored batches respect the server limit without dropping later symbols", async () => {
  const f = fixture();
  const symbols = Array.from({ length: 65 }, (_, i) => `S${i}`);
  const load = f.cache.load(symbols, false); await f.flush();
  assert.deepEqual(f.requests.map(request => request.symbols.length), [60, 5]);
  f.answer(0, {}); f.answer(1, { S64: quote(64) }); await load;
  assert.deepEqual(f.cache.quoteOf("S64"), quote(64));
});

test("failed requests stop the loading state and retry after a short cooldown", async () => {
  const f = fixture();
  const load = f.cache.load(["AAPL"], true); await f.flush();
  f.requests[0].reject(Error("Offline")); await load;
  assert.equal(f.cache.quoteOf("AAPL"), null);
  await f.cache.load(["AAPL"], true);
  assert.equal(f.requests.length, 1);
  f.advance(5000);
  const retry = f.cache.load(["AAPL"], true); await f.flush();
  f.answer(1, { AAPL: quote(100) }); await retry;
  assert.deepEqual(f.cache.quoteOf("AAPL"), quote(100));
});

test("a failed refresh retains a known quote without treating it as freshly fetched", async () => {
  const f = fixture();
  const load = f.cache.load(["AAPL"], true); await f.flush();
  f.answer(0, { AAPL: quote(100) }); await load;
  f.advance(60_000);
  const failed = f.cache.load(["AAPL"], true); await f.flush();
  f.requests[1].reject(Error("Offline")); await failed;
  assert.deepEqual(f.cache.quoteOf("AAPL"), quote(100));
  f.advance(5000);
  const retry = f.cache.load(["AAPL"], true); await f.flush();
  f.answer(2, { AAPL: quote(120) }); await retry;
  assert.deepEqual(f.cache.quoteOf("AAPL"), quote(120));
});
