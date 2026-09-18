import { exploreUniverse } from "./explore-data";
import { explorePerformance, type ExploreRange } from "./explore-performance";
import { compareBenchmark } from "./compare-data";
import type { Holding } from "./watchlist-data";

export const availableWatchlistTickers = exploreUniverse.map(stock => stock.ticker);

/** Use the same demo snapshot as Explore; only ticker membership is persisted. */
export function watchlistRows(tickers: string[], range: ExploreRange = "YTD"): Holding[] {
  return tickers.flatMap(ticker => {
    const stock = exploreUniverse.find(item => item.ticker === ticker);
    if (!stock) return [];
    const performance = explorePerformance(stock, range);
    if (!performance) return [];
    return [{
      ticker: stock.ticker, name: stock.name, price: stock.price, currency: stock.currency,
      changePct: stock.changePct,
      changeAbs: Number((stock.price - stock.price / (1 + stock.changePct / 100)).toFixed(2)),
      vsBenchmarkPct: Number((performance.stockReturn - compareBenchmark.returnByRange[range]).toFixed(2)),
      logoSrc: stock.logoSrc,
    }];
  });
}
