import type { ExploreStock } from "./explore-data";
import { periods, type Period } from "./period-returns";
import { gapBetween } from "./standing";

export const exploreRanges = periods;
export type ExploreRange = Period;

/** A stock's return over the range against its sector benchmark's; null when either is missing. */
export function explorePerformance(stock: ExploreStock, range: ExploreRange) {
  const stockReturn = stock.returns[range];
  const benchmarkReturn = stock.benchmarkReturns[range];
  const gap = gapBetween(stockReturn, benchmarkReturn);
  if (stockReturn === null || benchmarkReturn === null || gap === null) return null;
  return { stockReturn, benchmarkReturn, gap };
}

export type ExplorePerformance = NonNullable<ReturnType<typeof explorePerformance>>;
