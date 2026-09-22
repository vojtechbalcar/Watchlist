import { exploreRanges, type ExploreRange } from "./explore-performance";
import { watchlistRows, type WatchlistRow } from "./watchlist-catalog";

export { marketBenchmark as compareBenchmark } from "./market-benchmark";
export type CompareRange = ExploreRange;
export const compareRanges = exploreRanges;
export const compareColors = ["var(--color-series-1)", "var(--color-series-2)", "var(--color-series-3)"] as const;

export type CompareRow = {
  series: { ticker: string; colorVar: string };
  holding: WatchlistRow;
  returnPct: number;
  vsBenchmarkPct: number;
  /** Difference in percentage points; a stock's comparison with itself is blank. */
  vsPeers: Record<string, number | null>;
};

/** All returns and market gaps come from the same catalog as the saved watchlist. */
export function compareRows(
  range: CompareRange,
  selected: string[],
  colorSlots: Readonly<Record<string, number>> = {},
): CompareRow[] {
  const chosen = watchlistRows(selected, range);
  return chosen.map((holding, index) => ({
    series: {
      ticker: holding.ticker,
      colorVar: compareColors[colorSlots[holding.ticker] ?? index % compareColors.length],
    },
    holding,
    returnPct: holding.returnPct,
    vsBenchmarkPct: holding.vsBenchmarkPct,
    vsPeers: Object.fromEntries(chosen.map(peer => [
      peer.ticker,
      peer.ticker === holding.ticker ? null : Number((holding.returnPct - peer.returnPct).toFixed(2)),
    ])),
  }));
}
