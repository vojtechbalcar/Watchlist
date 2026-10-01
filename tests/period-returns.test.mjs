import assert from "node:assert/strict";
import test from "node:test";
import { parseStoredCloses, periodReturn } from "../src/lib/period-returns.ts";

const series = [
  ["2025-09-30", 80], ["2025-12-31", 90], ["2026-01-02", 92],
  ["2026-08-29", 95], ["2026-09-01", 96], ["2026-09-23", 98],
  ["2026-09-29", 99], ["2026-09-30", 100],
].map(([date, close]) => ({ date, close }));
const close = (value, expected) => assert.ok(Math.abs(value - expected) < 1e-9, `${value} ≠ ${expected}`);

test("each period starts at the last close on or before its reach-back date", () => {
  close(periodReturn(series, "1D"), (100 / 99 - 1) * 100);
  close(periodReturn(series, "1W"), (100 / 98 - 1) * 100); // 09-23
  close(periodReturn(series, "1M"), (100 / 95 - 1) * 100); // 08-30 → 08-29
  close(periodReturn(series, "YTD"), (100 / 90 - 1) * 100); // last close of 2025
  close(periodReturn(series, "1Y"), 25); // 2025-09-30
});

test("a history too short for the period gives null, not a wrong number", () => {
  const short = series.slice(-3);
  assert.equal(periodReturn(short, "1M"), null);
  assert.equal(periodReturn(short.slice(-1), "1D"), null);
  assert.equal(periodReturn([], "1W"), null);
});

test("a benchmark is measured to the stock's latest date", () => {
  const benchmark = [...series, { date: "2026-10-01", close: 200 }];
  close(periodReturn(benchmark, "1D", "2026-09-30"), (100 / 99 - 1) * 100);
});

test("stored closes are parsed, sorted, and cleaned", () => {
  assert.deepEqual(parseStoredCloses([["2026-09-30", 2], ["2026-09-29", 1], ["bad"], ["2026-09-28", "x"], null]), [
    { date: "2026-09-29", close: 1 }, { date: "2026-09-30", close: 2 },
  ]);
  assert.deepEqual(parseStoredCloses(null), []);
});
