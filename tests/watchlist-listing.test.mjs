import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { listingFigures } = await import("../src/lib/watchlist-listing.ts");

const closes = [["2025-12-31", 100], ["2026-09-29", 110], ["2026-09-30", 120]];

test("a listing's figures run to its cached price, like a tracked stock's", () => {
  const figures = listingFigures({ closes, price: 126, changeAbs: 6, changePct: 5, priceFetchedAt: new Date("2026-10-01T14:00:00Z") });
  assert.equal(figures.price, 126);
  assert.equal(figures.changePct, 5);
  assert.equal(figures.returns["1D"], 5);
  assert.equal(figures.returns.YTD, 26);
  assert.deepEqual(figures.series.YTD.at(-1), ["2026-10-01", 26]);
});

test("a price fetched before the open replaces nothing; it is the previous session's", () => {
  const figures = listingFigures({ closes, price: 120, changeAbs: 10, changePct: 9.0909, priceFetchedAt: new Date("2026-10-01T12:00:00Z") });
  assert.equal(figures.returns.YTD, 20);
  assert.deepEqual(figures.series.YTD.at(-1), ["2026-09-30", 20]);
});

test("without a price or closes the figures are gaps, not zeros", () => {
  const figures = listingFigures({ closes: null, price: null, changeAbs: null, changePct: null, priceFetchedAt: null });
  assert.deepEqual([figures.price, figures.changePct, figures.returns.YTD], [null, null, null]);
  assert.deepEqual(figures.series.YTD, []);
});
