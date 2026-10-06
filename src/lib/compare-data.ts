import { exploreRanges, type ExploreRange } from "./explore-performance";
import { watchlistRows, type WatchlistRow, type WatchlistStock } from "./watchlist-catalog";

export type CompareRange = ExploreRange;
export const compareRanges = exploreRanges;
export const compareColors = ["var(--color-series-1)", "var(--color-series-2)", "var(--color-series-3)"] as const;

export type CompareRow = {
  series: { ticker: string; colorVar: string };
  holding: WatchlistRow;
  returnPct: number | null;
  vsBenchmarkPct: number | null;
  /** Difference in percentage points; blank against itself or when either return is missing. */
  vsPeers: Record<string, number | null>;
};

/** All returns and market gaps come from the same rows as the saved watchlist. */
export function compareRows(
  stocks: WatchlistStock[],
  range: CompareRange,
  selected: string[],
  benchmark: Record<CompareRange, number | null>,
  colorSlots: Readonly<Record<string, number>> = {},
): CompareRow[] {
  const chosen = watchlistRows(stocks, selected, range, benchmark);
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
      peer.ticker === holding.ticker || holding.returnPct === null || peer.returnPct === null ? null : Number((holding.returnPct - peer.returnPct).toFixed(2)),
    ])),
  }));
}
