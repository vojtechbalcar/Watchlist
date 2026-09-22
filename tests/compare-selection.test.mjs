import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { initialComparison, reconcileComparison, addComparisonStock } = await import("../src/lib/compare-selection.ts");
const { compareRows } = await import("../src/lib/compare-data.ts");

test("initial comparison takes at most three unique saved stocks in saved order", () => {
  assert.deepEqual(initialComparison([]), []);
  assert.deepEqual(initialComparison(["UNH", "UNH", "AAPL", "MSFT", "NVDA"]).map(item => item.ticker), ["UNH", "AAPL", "MSFT"]);
});

test("picker accepts saved stocks only, prevents duplicates and enforces the limit", () => {
  const saved = ["UNH", "AAPL", "MSFT", "NVDA"];
  const full = initialComparison(saved);
  assert.deepEqual(addComparisonStock(full, "NVDA", saved), full);
  assert.deepEqual(addComparisonStock(full.slice(0, 1), "UNH", saved), full.slice(0, 1));
  assert.deepEqual(addComparisonStock([], "AMZN", saved), []);
  assert.equal(addComparisonStock([], "NVDA", saved)[0].ticker, "NVDA");
});

test("removing or replacing a stock preserves the other series' colors across periods", () => {
  const saved = ["UNH", "AAPL", "MSFT", "NVDA"];
  const initial = initialComparison(saved);
  const remaining = initial.filter(item => item.ticker !== "AAPL");
  const replaced = addComparisonStock(remaining, "NVDA", saved);
  assert.deepEqual(replaced, [initial[0], initial[2], { ticker: "NVDA", colorSlot: 1 }]);
  const slots = Object.fromEntries(replaced.map(item => [item.ticker, item.colorSlot]));
  for (const range of ["1D", "YTD", "1Y"]) {
    const rows = compareRows(range, replaced.map(item => item.ticker), slots);
    assert.equal(new Set(rows.map(row => row.series.colorVar)).size, 3);
    assert.equal(rows.find(row => row.series.ticker === "MSFT").series.colorVar, "var(--color-series-3)");
  }
  assert.deepEqual(saved, ["UNH", "AAPL", "MSFT", "NVDA"]);
});

test("cross-tab removals drop stale selections without refilling an intentional empty comparison", () => {
  const initial = initialComparison(["UNH", "AAPL", "MSFT"]);
  const removed = reconcileComparison(initial, ["AAPL", "MSFT", "NVDA"]);
  assert.deepEqual(removed, [initial[1], initial[2]]);
  assert.deepEqual(reconcileComparison(removed, ["UNH", "AAPL", "MSFT", "NVDA"]), removed);
  assert.deepEqual(reconcileComparison([], ["AAPL"]), []);
  assert.deepEqual(reconcileComparison(initial, []), []);
});
