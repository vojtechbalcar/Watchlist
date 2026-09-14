import assert from "node:assert/strict";
import test from "node:test";
import { exploreUniverse, sectors } from "../src/lib/explore-data.ts";
import { explorePerformance, exploreRanges, sectorReturns } from "../src/lib/explore-performance.ts";

test("every stock has valid returns for every selectable period", () => {
  for (const stock of exploreUniverse) {
    for (const range of exploreRanges) {
      const result = explorePerformance(stock, range);
      assert.ok(result, `${stock.ticker} missing ${range}`);
      assert.ok(Number.isFinite(result.stockReturn));
      assert.ok(Number.isFinite(result.benchmarkReturn));
      assert.equal(result.gap, Number((result.stockReturn - result.benchmarkReturn).toFixed(2)));
    }
  }
});

test("stocks in the same sector share a benchmark for each period", () => {
  for (const sector of sectors) {
    for (const range of exploreRanges) {
      const baselines = exploreUniverse.filter(stock => stock.sector === sector)
        .map(stock => explorePerformance(stock, range).benchmarkReturn);
      assert.deepEqual([...new Set(baselines)], [sectorReturns[sector][range]]);
    }
  }
});

test("changing period changes performance without changing the snapshot price", () => {
  const apple = exploreUniverse.find(stock => stock.ticker === "AAPL");
  const before = JSON.stringify(apple);
  assert.deepEqual(explorePerformance(apple, "1D"), { stockReturn: 2.44, benchmarkReturn: 0.62, gap: 1.82 });
  assert.deepEqual(explorePerformance(apple, "1M"), { stockReturn: 1.8, benchmarkReturn: 2.65, gap: -0.85 });
  assert.equal(JSON.stringify(apple), before);
});

test("negative returns can beat a benchmark and equal returns have a zero gap", () => {
  const exxon = exploreUniverse.find(stock => stock.ticker === "XOM");
  const result = explorePerformance(exxon, "1M");
  assert.ok(result.stockReturn < 0);
  assert.ok(result.gap > 0);
  const pfizer = exploreUniverse.find(stock => stock.ticker === "PFE");
  assert.equal(explorePerformance(pfizer, "1M").gap, 0);
});

test("a stock without period data is unavailable, never fabricated", () => {
  const unknown = { ...exploreUniverse[0], ticker: "NEW" };
  assert.equal(explorePerformance(unknown, "1Y"), null);
  assert.equal(explorePerformance(unknown, "1D").stockReturn, unknown.changePct);
});
