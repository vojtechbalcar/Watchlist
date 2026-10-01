import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { instrumentMarket, returnSeries, withLivePrice } = await import("../src/lib/market.ts");

const closes = [
  ["2025-12-31", 100], ["2026-09-01", 110], ["2026-09-23", 115], ["2026-09-29", 118], ["2026-09-30", 120],
].map(([date, close]) => ({ date, close }));
const quote = (ymd, price, changePct) => ({ price, changeAbs: price - 120, changePct, asOf: new Date(`${ymd}T15:00:00Z`), ymd });

test("the live price becomes today's point, or replaces today's close", () => {
  assert.deepEqual(withLivePrice(closes, quote("2026-10-01", 126, 5)).slice(-2), [{ date: "2026-09-30", close: 120 }, { date: "2026-10-01", close: 126 }]);
  assert.deepEqual(withLivePrice(closes, quote("2026-09-30", 121, 2.54)).slice(-2), [{ date: "2026-09-29", close: 118 }, { date: "2026-09-30", close: 121 }]);
  assert.equal(withLivePrice(closes, null), closes);
});

test("returns run to the live price; 1D is the exchange's day change", () => {
  const market = instrumentMarket(closes, quote("2026-10-01", 126, 5));
  assert.equal(market.price, 126);
  assert.equal(market.returns["1D"], 5);
  assert.equal(market.returns.YTD, 26);
  assert.equal(market.returns["1W"], 9.5652); // from 2026-09-23
  assert.equal(market.returns["1Y"], null); // history starts 2025-12-31
});

test("without a quote, the last close stands in and gaps stay null", () => {
  const market = instrumentMarket(closes, null);
  assert.equal(market.price, 120);
  assert.equal(market.changeAbs, null);
  assert.equal(market.returns["1D"], 1.6949);
  assert.deepEqual(instrumentMarket([], null), { price: null, changeAbs: null, changePct: null, asOf: null, returns: { "1D": null, "1W": null, "1M": null, YTD: null, "1Y": null } });
});

test("series start at 0% and end at the period return", () => {
  const series = returnSeries(closes, "YTD");
  assert.deepEqual(series[0], ["2025-12-31", 0]);
  assert.deepEqual(series.at(-1), ["2026-09-30", 20]);
});

test("long series are thinned but keep both ends", () => {
  const long = Array.from({ length: 400 }, (_, i) => ({ date: new Date(Date.UTC(2025, 6, 1) + i * 86400000).toISOString().slice(0, 10), close: 100 + i }));
  const series = returnSeries(long, "1Y", 60);
  assert.equal(series.length, 60);
  assert.equal(series.at(-1)[0], long.at(-1).date);
  assert.equal(series[0][1], 0);
});
