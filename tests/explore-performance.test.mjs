import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { explorePerformance, exploreRanges } = await import("../src/lib/explore-performance.ts");
const { marketView } = await import("../src/lib/market-view.ts");
const { trackedStocks, sectorBenchmarks, benchmarkTicker } = await import("../src/lib/explore-data.ts");

const all = (value) => Object.fromEntries(exploreRanges.map(range => [range, value]));
const figures = (ytd) => ({ price: 100, changeAbs: 1, changePct: 1, asOf: null, returns: { ...all(ytd), "1D": 1 } });

test("each stock is measured against its own sector's benchmark", () => {
  const instruments = { NVDA: figures(30), SOXX: figures(25), QQQ: figures(10), SPY: figures(12) };
  const market = marketView({ builtAt: "", asOf: null, instruments });
  const nvda = explorePerformance(market.stock("NVDA"), "YTD");
  assert.deepEqual(nvda, { stockReturn: 30, benchmarkReturn: 25, gap: 5 });
  assert.equal(benchmarkTicker(sectorBenchmarks.Semiconductors), "SOXX");
  assert.equal(benchmarkTicker(sectorBenchmarks.Technology), "QQQ");
});

test("a missing stock or benchmark return means no comparison, not a zero", () => {
  const market = marketView({ builtAt: "", asOf: null, instruments: { MSFT: figures(13), XOM: figures(5) } });
  assert.equal(explorePerformance(market.stock("MSFT"), "YTD"), null); // no QQQ
  assert.equal(explorePerformance(market.stock("AAPL"), "YTD"), null); // no AAPL
});

test("every tracked stock appears in the market view, priced or not", () => {
  const market = marketView({ builtAt: "", asOf: null, instruments: {} });
  assert.equal(market.stocks.length, trackedStocks.length);
  assert.ok(market.stocks.every(stock => stock.price === null && stock.returns.YTD === null));
  assert.deepEqual(market.indices.map(index => index.ticker), ["SPY", "QQQ", "DIA", "IWM"]);
});

test("gaps are rounded to hundredths of a point", () => {
  const market = marketView({ builtAt: "", asOf: null, instruments: { CAT: figures(10.123), XLI: figures(4.1) } });
  assert.equal(explorePerformance(market.stock("CAT"), "YTD").gap, 6.02);
});
