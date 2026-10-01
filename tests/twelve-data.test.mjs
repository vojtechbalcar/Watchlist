import assert from "node:assert/strict";
import test from "node:test";
import { parseDailyCloses, parseLogo, parseQuotes, parseStockList } from "../src/lib/twelve-data.ts";
import { creditsGranted, usageBuckets } from "../src/lib/api-budget.ts";

const quote = (symbol, close) => ({ symbol, close: String(close), change: "1.5", percent_change: "0.75", timestamp: 1790775000, last_quote_at: 1790798340 });

test("stock list keeps NASDAQ and NYSE shares and drops OTC, warrants, and duplicates", () => {
  const list = parseStockList({ data: [
    { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "Common Stock", currency: "USD" },
    { symbol: "AAPL", name: "Apple Inc.", exchange: "NYSE", type: "Common Stock", currency: "USD" },
    { symbol: "TSM", name: "Taiwan Semiconductor", exchange: "NYSE", type: "American Depositary Receipt", currency: "USD" },
    { symbol: "O", name: "Realty Income", exchange: "NYSE", type: "REIT", currency: "USD" },
    { symbol: "AABB", name: "Asia Broadband", exchange: "OTC", type: "Common Stock", currency: "USD" },
    { symbol: "XYZ.WS", name: "Some Warrant", exchange: "NYSE", type: "Warrant", currency: "USD" },
    { symbol: 42, name: "Broken", exchange: "NYSE", type: "Common Stock" },
  ] });
  assert.deepEqual(list.map(stock => stock.symbol), ["AAPL", "TSM", "O"]);
  assert.equal(list[0].exchange, "NASDAQ");
  assert.deepEqual(parseStockList({ status: "ok" }), []);
});

test("a single-symbol quote is the bare object; a batch is keyed by symbol", () => {
  const [single] = parseQuotes(quote("AAPL", 333.02), ["AAPL"]);
  assert.deepEqual(single, { symbol: "AAPL", price: 333.02, changeAbs: 1.5, changePct: 0.75, asOf: new Date(1790798340 * 1000) });

  const batch = parseQuotes({ AAPL: quote("AAPL", 333.02), MSFT: quote("MSFT", 410), NOPE: { code: 400, status: "error", message: "not found" } }, ["AAPL", "MSFT", "NOPE"]);
  assert.deepEqual(batch.map(row => [row.symbol, row.price]), [["AAPL", 333.02], ["MSFT", 410]]);
});

test("quotes with unreadable numbers are skipped, not stored as NaN", () => {
  assert.deepEqual(parseQuotes({ ...quote("AAPL", 1), close: "n/a" }, ["AAPL"]), []);
});

test("daily closes keep valid dated rows per symbol", () => {
  const closes = parseDailyCloses({
    AAPL: { meta: {}, values: [{ datetime: "2026-09-30", close: "333.02" }, { datetime: "2026-09-29", close: "bad" }], status: "ok" },
    SPY: { meta: {}, values: [{ datetime: "2026-09-30 15:59:00", close: "600" }], status: "ok" },
  }, ["AAPL", "SPY"]);
  assert.deepEqual(closes.get("AAPL"), [{ date: "2026-09-30", close: 333.02 }]);
  assert.deepEqual(closes.get("SPY"), []);
});

test("logo URLs must be https", () => {
  assert.equal(parseLogo({ meta: { symbol: "AAPL" }, url: "https://api.twelvedata.com/logo/apple.com" }), "https://api.twelvedata.com/logo/apple.com");
  assert.equal(parseLogo({ url: "" }), null);
  assert.equal(parseLogo({ url: "javascript:alert(1)" }), null);
  assert.equal(parseLogo(null), null);
});

test("usage buckets are the UTC minute and day", () => {
  assert.deepEqual(usageBuckets(new Date("2026-10-01T14:05:59Z")), { minute: "m:2026-10-01T14:05", day: "d:2026-10-01" });
});

test("credits are granted up to the caller's minute and day limits", () => {
  assert.equal(creditsGranted(5, 5, 100, "job"), 5);
  assert.equal(creditsGranted(5, 8, 100, "job"), 3); // job stops at 6 a minute
  assert.equal(creditsGranted(5, 8, 100, "search"), 5); // search may use all 8
  assert.equal(creditsGranted(5, 9, 100, "search"), 4);
  assert.equal(creditsGranted(5, 5, 603, "job"), 2); // job stops at 600 a day
  assert.equal(creditsGranted(3, 20, 100, "search"), 0);
});
