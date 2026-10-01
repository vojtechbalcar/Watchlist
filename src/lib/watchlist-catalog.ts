import { trackedStocks, type ExploreStock } from "./explore-data";
import type { ExploreRange } from "./explore-performance";
import type { Holding } from "./watchlist-data";

export const availableWatchlistTickers = trackedStocks.map(stock => stock.ticker);
export type WatchlistRow = Holding & { returnPct: number | null };

/**
 * Saved tickers as rows, against the whole-market benchmark over `range`.
 * A stock without data yet keeps its row with gaps rather than vanishing.
 */
export function watchlistRows(stocks: ExploreStock[], tickers: string[], range: ExploreRange, benchmark: Record<ExploreRange, number | null>): WatchlistRow[] {
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
    }];
  });
}
