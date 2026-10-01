import type { ExploreStock } from "./explore-data";
import { periods, type Period } from "./period-returns";

export const exploreRanges = periods;
export type ExploreRange = Period;

/** A stock's return over the range against its sector benchmark's; null when either is missing. */
export function explorePerformance(stock: ExploreStock, range: ExploreRange) {
  const stockReturn = stock.returns[range];
  const benchmarkReturn = stock.benchmarkReturns[range];
  if (stockReturn === null || benchmarkReturn === null) return null;
  return {
    stockReturn,
    benchmarkReturn,
    gap: Number((stockReturn - benchmarkReturn).toFixed(2)),
  };
}

export type ExplorePerformance = NonNullable<ReturnType<typeof explorePerformance>>;
