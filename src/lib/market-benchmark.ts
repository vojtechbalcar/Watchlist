import type { ExploreRange } from "./explore-performance";

/** Shared illustrative benchmark; production prices will come from Postgres. */
export const marketBenchmark = {
  label: "S&P 500",
  returnByRange: { "1D": 0.31, "1W": 1.12, "1M": 2.65, YTD: 14.6, "1Y": 18.4 } satisfies Record<ExploreRange, number>,
};
