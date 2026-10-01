import { benchmarkTicker, marketBenchmarkLabel, marketIndexLabels, sectorBenchmarks, trackedStocks, type ExploreStock } from "./explore-data";
import type { MarketSnapshot } from "./market";
import { periods, type Period } from "./period-returns";

export type Returns = Record<Period, number | null>;
export type MarketIndexQuote = { label: string; ticker: string; price: number | null; changePct: number | null };

const noReturns = Object.fromEntries(periods.map(period => [period, null])) as Returns;

/** How the pages see the snapshot: tracked stocks with their figures, and the benchmarks they're measured against. */
export function marketView(snapshot: MarketSnapshot) {
  const instrument = (ticker: string) => snapshot.instruments[ticker];
  const returnsOf = (label: string) => instrument(benchmarkTicker(label))?.returns ?? noReturns;

  const stocks: ExploreStock[] = trackedStocks.map(stock => {
    const figures = instrument(stock.ticker);
    return {
      ...stock,
      price: figures?.price ?? null,
      changePct: figures?.changePct ?? null,
      changeAbs: figures?.changeAbs ?? null,
      returns: figures?.returns ?? noReturns,
      benchmarkReturns: returnsOf(sectorBenchmarks[stock.sector]),
    };
  });
  const byTicker = new Map(stocks.map(stock => [stock.ticker, stock]));

  return {
    asOf: snapshot.asOf,
    stocks,
    stock: (ticker: string) => byTicker.get(ticker.toUpperCase()),
    /** The whole-market benchmark watchlists and Compare use. */
    benchmark: { label: marketBenchmarkLabel, returnByRange: returnsOf(marketBenchmarkLabel) },
    indices: marketIndexLabels.map((label): MarketIndexQuote => {
      const figures = instrument(benchmarkTicker(label));
      return { label, ticker: benchmarkTicker(label), price: figures?.price ?? null, changePct: figures?.changePct ?? null };
    }),
  };
}

export type MarketView = ReturnType<typeof marketView>;
