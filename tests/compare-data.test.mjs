import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { compareRows, compareRanges } = await import("../src/lib/compare-data.ts");
const { explorePerformance } = await import("../src/lib/explore-performance.ts");
const { watchlistRows } = await import("../src/lib/watchlist-catalog.ts");
const { marketView } = await import("../src/lib/market-view.ts");

const returns = (ytd, rest = {}) => ({ "1D": 0.5, "1W": 1, "1M": 2, YTD: ytd, "1Y": ytd + 5, ...rest });
const figures = (price, ytd, rest) => ({ price, changeAbs: 1, changePct: 0.5, asOf: "2026-10-01T15:00:00.000Z", returns: returns(ytd, rest) });
// A snapshot shaped like the price job's: some stocks, their sector ETFs, and the S&P 500.
const market = marketView({
  builtAt: "2026-10-01T15:00:00.000Z", asOf: "2026-10-01T15:00:00.000Z",
  instruments: {
    MSFT: figures(500, 13.21), NVDA: figures(180, 31.2), UNH: figures(300, -8.3), AAPL: figures(250, 15.73, { "1Y": null }),
    QQQ: figures(600, 14.6), SOXX: figures(250, 24.8), XLV: figures(140, 5.6), SPY: figures(700, 14.6),
  },
});
const benchmark = market.benchmark.returnByRange;

test("Compare shares every stock's return with Explore and its market gap with Watchlist", () => {
  for (const range of compareRanges) {
    for (const ticker of ["MSFT", "NVDA", "UNH"]) {
      const stock = market.stock(ticker);
      const [row] = compareRows(market.stocks, range, [ticker], benchmark);
      const [saved] = watchlistRows(market.stocks, [ticker], range, benchmark);
      assert.equal(row.returnPct, explorePerformance(stock, range).stockReturn);
      assert.equal(row.holding.price, stock.price);
      assert.equal(row.vsBenchmarkPct, saved.vsBenchmarkPct);
      assert.equal(row.vsBenchmarkPct, Number((row.returnPct - benchmark[range]).toFixed(2)));
    }
  }
});

test("MSFT is behind the S&P 500 year to date", () => {
  const [row] = compareRows(market.stocks, "YTD", ["MSFT"], benchmark);
  assert.equal(row.returnPct, 13.21);
  assert.equal(row.vsBenchmarkPct, -1.39);
});

test("a stock without data keeps its row with gaps instead of a made-up number", () => {
  const [row] = compareRows(market.stocks, "YTD", ["XOM"], benchmark);
  assert.equal(row.returnPct, null);
  assert.equal(row.vsBenchmarkPct, null);
  assert.equal(row.holding.price, null);
  const [apple] = compareRows(market.stocks, "1Y", ["AAPL", "MSFT"], benchmark);
  assert.equal(apple.returnPct, null);
  assert.equal(apple.vsPeers.MSFT, null);
});

test("comparison rows preserve selection order, ignore unknown stocks, and deduplicate", () => {
  assert.deepEqual(compareRows(market.stocks, "YTD", ["UNH", "MSFT", "UNH", "UNKNOWN", "AAPL"], benchmark).map(row => row.series.ticker), ["UNH", "MSFT", "AAPL"]);
  assert.deepEqual(compareRows(market.stocks, "YTD", [], benchmark), []);
});

test("peer differences are antisymmetric and self comparisons are blank", () => {
  for (const range of compareRanges) {
    const rows = compareRows(market.stocks, range, ["UNH", "NVDA", "MSFT"], benchmark);
    for (const row of rows) {
      assert.equal(row.vsPeers[row.series.ticker], null);
      for (const peer of rows.filter(peer => peer !== row)) {
        assert.equal(row.vsPeers[peer.series.ticker] + peer.vsPeers[row.series.ticker], 0);
        assert.equal(row.vsPeers[peer.series.ticker], Number((row.returnPct - peer.returnPct).toFixed(2)));
      }
    }
  }
});
