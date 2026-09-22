import { exploreUniverse } from "./explore-data";
import { explorePerformance, type ExploreRange } from "./explore-performance";
import { marketBenchmark } from "./market-benchmark";
import type { Holding } from "./watchlist-data";

export const availableWatchlistTickers = exploreUniverse.map(stock => stock.ticker);
export type WatchlistRow = Holding & { returnPct: number };

/** Use the same demo snapshot as Explore; only ticker membership is persisted. */
export function watchlistRows(tickers: string[], range: ExploreRange = "YTD"): WatchlistRow[] {
  return [...new Set(tickers)].flatMap(ticker => {
    const stock = exploreUniverse.find(item => item.ticker === ticker);
    if (!stock) return [];
    const performance = explorePerformance(stock, range);
    if (!performance || !Number.isFinite(performance.stockReturn)) return [];
    return [{
      ticker: stock.ticker, name: stock.name, price: stock.price, currency: stock.currency,
      changePct: stock.changePct,
      changeAbs: Number((stock.price - stock.price / (1 + stock.changePct / 100)).toFixed(2)),
      returnPct: performance.stockReturn,
      vsBenchmarkPct: Number((performance.stockReturn - marketBenchmark.returnByRange[range]).toFixed(2)),
      logoSrc: stock.logoSrc,
    }];
  });
}
