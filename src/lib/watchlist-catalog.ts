import type { ExploreRange } from "./explore-performance";
import type { Holding } from "./watchlist-data";

/**
 * Any NASDAQ or NYSE stock can be saved, not only the tracked ones, so saved
 * tickers are checked by form (as in BRK.B or BF-A) rather than against a list.
 */
export const isWatchlistTicker = (ticker: string) => /^[A-Z0-9][A-Z0-9.-]{0,11}$/.test(ticker);
export type WatchlistRow = Holding & { returnPct: number | null };

/** The figures a row reads, from a tracked stock or a listing alike. */
export type WatchlistStock = Omit<Holding, "vsBenchmarkPct"> & { returns: Record<ExploreRange, number | null> };

/**
 * Saved tickers as rows, against the whole-market benchmark over `range`.
 * A stock without data yet keeps its row with gaps rather than vanishing.
 */
export function watchlistRows(stocks: WatchlistStock[], tickers: string[], range: ExploreRange, benchmark: Record<ExploreRange, number | null>): WatchlistRow[] {
  return [...new Set(tickers)].flatMap(ticker => {
    const stock = stocks.find(item => item.ticker === ticker);
    if (!stock) return [];
    const returnPct = stock.returns[range];
    const benchmarkReturn = benchmark[range];
    return [{
      ticker: stock.ticker, name: stock.name, price: stock.price, currency: stock.currency,
      changePct: stock.changePct, changeAbs: stock.changeAbs,
      returnPct,
      vsBenchmarkPct: returnPct === null || benchmarkReturn === null ? null : Number((returnPct - benchmarkReturn).toFixed(2)),
      logoSrc: stock.logoSrc,
      remoteLogo: stock.remoteLogo,
      untracked: stock.untracked,
    }];
  });
}
