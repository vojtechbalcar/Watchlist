import assert from "node:assert/strict";
import test from "node:test";
import { alignTo, averageLines, axisLabels, gapBands } from "../src/lib/chart-series.ts";

const axis = [["2026-09-28", 0], ["2026-09-29", 1], ["2026-09-30", 2], ["2026-10-01", 3]];

test("lines are read at the axis dates, carried over gaps, null before they start", () => {
  assert.deepEqual(alignTo(axis, [["2026-09-29", 0], ["2026-10-01", 5]]), [null, 0, 0, 5]);
  assert.deepEqual(alignTo(axis, axis), [0, 1, 2, 3]);
  assert.deepEqual(alignTo(axis, []), [null, null, null, null]);
});

test("averages skip lines without a value at that point", () => {
  assert.deepEqual(averageLines([[0, 2, 4], [null, 4, 8]]), [0, 3, 6]);
  assert.deepEqual(averageLines([[null], [null]]), [null]);
  assert.deepEqual(averageLines([]), []);
});

test("axis labels are evenly spaced; long spans show month and year", () => {
  assert.deepEqual(axisLabels(axis).map(label => label.label), ["Sep 28", "Sep 29", "Sep 30", "Oct 1"]);
  const year = [["2025-10-01", 0], ["2026-04-01", 0], ["2026-10-01", 0]];
  assert.deepEqual(axisLabels(year).map(label => label.label), ["Oct ’25", "Apr ’26", "Oct ’26"]); // duplicate positions collapse
  assert.deepEqual(axisLabels([]), []);
});

test("the gap between two lines splits into ahead and behind bands where they cross", () => {
  // Ahead at 0–1, crossing halfway to index 2, behind until 3.
  assert.deepEqual(gapBands([2, 2, -2, -1], [0, 0, 0, 0]), [
    { ahead: true, points: [{ at: 0, line: 2, base: 0 }, { at: 1, line: 2, base: 0 }, { at: 1.5, line: 0, base: 0 }] },
    { ahead: false, points: [{ at: 1.5, line: 0, base: 0 }, { at: 2, line: -2, base: 0 }, { at: 3, line: -1, base: 0 }] },
  ]);
});

test("gap bands break where either line has no value", () => {
  assert.deepEqual(gapBands([1, null, 1, 1], [0, 0, 0, 0]).map(band => band.points.map(point => point.at)), [[0], [2, 3]]);
  assert.deepEqual(gapBands([], []), []);
});
