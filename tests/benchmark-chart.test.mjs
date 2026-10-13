import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { prepareBenchmarkChart } = await import("../src/lib/benchmark-chart.ts");
const axis = [["2026-10-01", 0], ["2026-10-02", 1], ["2026-10-05", 2]];
const prepare = options => prepareBenchmarkChart({ benchmarkLabel: "S&P 500", range: "YTD", stocks: [], ...options });

test("tracked and listed histories share benchmark dates and an equal-weight average", () => {
  const result = prepare({
    series: { SPY: { YTD: axis }, AAPL: { YTD: [["2026-10-01", 0], ["2026-10-05", 6]] } },
    extraSeries: { AAP: { YTD: [["2026-10-02", 2], ["2026-10-05", 4]] } },
    stocks: [{ ticker: "AAPL", returnPct: 6 }, { ticker: "AAP", returnPct: 4 }],
  });
  assert.deepEqual(result, {
    axis, benchmark: [0, 1, 2], stockLines: [[0, 0, 6], [null, 2, 4]],
    average: [0, 1, 5], domain: { min: 0, max: 8 },
  });
});

test("missing histories stay unknown and never count as zero in averages", () => {
  const result = prepare({
    series: { SPY: { YTD: axis }, AAPL: { YTD: [["2026-10-02", -3]] } },
    stocks: [{ ticker: "MISSING" }, { ticker: "AAPL" }],
  });
  assert.deepEqual(result.stockLines, [[null, null, null], [null, -3, -3]]);
  assert.deepEqual(result.average, [null, -3, -3]);
  assert.deepEqual(result.domain, { min: -4, max: 4 });
});

test("a missing benchmark never manufactures a trading date axis", () => {
  const result = prepare({
    extraSeries: { AAP: { YTD: [["2026-10-01", 0], ["2026-10-02", 8]] } },
    stocks: [{ ticker: "AAP", returnPct: 8 }],
  });
  assert.deepEqual(result.axis, []);
  assert.deepEqual(result.stockLines, [[]]);
  assert.deepEqual(result.average, []);
  assert.deepEqual(result.domain, { min: 0, max: 8 });
});

test("tracked history wins, with listed history as a fallback for the selected period", () => {
  const result = prepare({
    series: { SPY: { YTD: axis }, AAPL: { YTD: axis }, AAP: { "1D": [["2026-10-05", 0]] } },
    extraSeries: { AAPL: { YTD: [["2026-10-01", 99]] }, AAP: { YTD: [["2026-10-01", -1]] } },
    stocks: [{ ticker: "AAPL" }, { ticker: "AAP" }],
  });
  assert.deepEqual(result.stockLines, [[0, 1, 2], [-1, -1, -1]]);
});

test("a one-date chart and negative endpoints produce a finite domain", () => {
  const result = prepare({
    series: { SPY: { YTD: [["2026-10-01", 0]] }, AAPL: { YTD: [["2026-10-01", -5]] } },
    stocks: [{ ticker: "AAPL", returnPct: -10 }, { ticker: "MISSING", returnPct: null }],
  });
  assert.deepEqual(result.stockLines, [[-5], [null]]);
  assert.deepEqual(result.average, [-5]);
  assert.deepEqual(result.domain, { min: -12, max: 0 });
});

test("preparation leaves the stored history untouched and handles an empty selection", () => {
  const series = Object.freeze({ SPY: Object.freeze({ YTD: Object.freeze(axis.map(point => Object.freeze([...point]))) }) });
  const result = prepare({ series });
  assert.deepEqual(result.stockLines, []);
  assert.deepEqual(result.average, []);
  assert.deepEqual(result.benchmark, [0, 1, 2]);
  assert.deepEqual(prepare({}).domain, { min: 0, max: 4 });
});
