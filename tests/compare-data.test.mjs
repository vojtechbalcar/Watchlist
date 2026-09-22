import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { compareRows, compareRanges, compareBenchmark } = await import("../src/lib/compare-data.ts");
const { exploreUniverse } = await import("../src/lib/explore-data.ts");
const { explorePerformance } = await import("../src/lib/explore-performance.ts");
const { watchlistRows } = await import("../src/lib/watchlist-catalog.ts");

test("Compare shares every stock's return with Explore and market gap with Watchlist", () => {
  for (const range of compareRanges) {
    for (const stock of exploreUniverse) {
      const [row] = compareRows(range, [stock.ticker]);
      assert.ok(row, `${stock.ticker} missing ${range}`);
      const performance = explorePerformance(stock, range);
      const [saved] = watchlistRows([stock.ticker], range);
      assert.equal(row.returnPct, performance.stockReturn);
      assert.equal(row.holding.price, stock.price);
      assert.equal(row.vsBenchmarkPct, saved.vsBenchmarkPct);
      assert.equal(row.vsBenchmarkPct, Number((row.returnPct - compareBenchmark.returnByRange[range]).toFixed(2)));
    }
  }
});

test("MSFT is behind the S&P 500 year to date on every stock view", () => {
  const [row] = compareRows("YTD", ["MSFT"]);
  assert.equal(row.returnPct, 13.21);
  assert.equal(row.vsBenchmarkPct, -1.39);
});

test("comparison rows preserve selection order, ignore unknown stocks, and deduplicate", () => {
  assert.deepEqual(compareRows("YTD", ["UNH", "MSFT", "UNH", "UNKNOWN", "AAPL"]).map(row => row.series.ticker), ["UNH", "MSFT", "AAPL"]);
  assert.deepEqual(compareRows("YTD", []), []);
});

test("peer differences are antisymmetric and self comparisons are blank", () => {
  for (const range of compareRanges) {
    const rows = compareRows(range, ["UNH", "NVDA", "MSFT"]);
    for (const row of rows) {
      assert.equal(row.vsPeers[row.series.ticker], null);
      for (const peer of rows.filter(peer => peer !== row)) {
        assert.equal(row.vsPeers[peer.series.ticker] + peer.vsPeers[row.series.ticker], 0);
        assert.equal(row.vsPeers[peer.series.ticker], Number((row.returnPct - peer.returnPct).toFixed(2)));
      }
    }
  }
});
