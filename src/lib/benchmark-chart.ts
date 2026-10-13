import { alignTo, averageLines } from "./chart-series";
import { comparisonDomain } from "./compare-chart";
import { benchmarkTicker } from "./explore-data";
import type { MarketSeries } from "./market";
import type { Period } from "./period-returns";

/** Stored histories prepared for a watchlist average or individual stock comparison. */
export function prepareBenchmarkChart({ series = {}, extraSeries = {}, stocks, benchmarkLabel, range }: {
  series?: MarketSeries["series"];
  extraSeries?: MarketSeries["series"];
  stocks: readonly { ticker: string; returnPct?: number | null }[];
  benchmarkLabel: string;
  range: Period;
}) {
  const axis = series[benchmarkTicker(benchmarkLabel)]?.[range] ?? [];
  const benchmark = axis.map(([, value]) => value);
  const stockLines = stocks.map(({ ticker }) => alignTo(axis, series[ticker]?.[range] ?? extraSeries[ticker]?.[range] ?? []));
  return {
    axis,
    benchmark,
    stockLines,
    average: averageLines(stockLines),
    domain: comparisonDomain([
      ...benchmark,
      ...stockLines.flat().filter((value): value is number => value !== null),
      ...stocks.flatMap(stock => stock.returnPct ?? []),
    ]),
  };
}
