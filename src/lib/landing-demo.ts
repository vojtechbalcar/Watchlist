import type { ExploreStock } from "./explore-data";
import type { Holding } from "./watchlist-data";
import type { Period } from "./period-returns";

/*
 * Fixed example figures for the signed-out landing page's product tour.
 * They illustrate the product and are labelled that way; signed-in pages
 * read the market snapshot instead.
 */

export const landingBenchmark = {
  label: "S&P 500",
  returnByRange: { "1D": 0.31, "1W": 1.12, "1M": 2.65, YTD: 14.6, "1Y": 18.4 } satisfies Record<Period, number>,
};

const demo = (ticker: string, name: string, logoSrc: string, price: number, returns: Record<Period, number>): ExploreStock => ({
  ticker, name, sector: "Technology", currency: "USD", logoSrc, price,
  changePct: returns["1D"], changeAbs: Number((price - price / (1 + returns["1D"] / 100)).toFixed(2)),
  returns, benchmarkReturns: landingBenchmark.returnByRange,
});

export const landingStocks: ExploreStock[] = [
  demo("NVDA", "NVIDIA Corp", "/logos/nvda.png", 210.84, { "1D": 3.44, "1W": 5.6, "1M": 9.8, YTD: 31.2, "1Y": 45.3 }),
  demo("MSFT", "Microsoft Corp", "/logos/msft.png", 418.59, { "1D": 0.92, "1W": 1.5, "1M": 4.1, YTD: 13.21, "1Y": 23.7 }),
];

/** The tour's watchlist preview: three familiar rows and the watchlist's YTD return. */
export const landingHoldings: Holding[] = [
  { ticker: "NVDA", name: "NVIDIA Corp", price: 184.72, currency: "USD", changeAbs: 6.81, changePct: 3.83, vsBenchmarkPct: 1.11, logoSrc: "/logos/nvda.png" },
  { ticker: "AAPL", name: "Apple Inc.", price: 309.23, currency: "USD", changeAbs: -1.08, changePct: -0.35, vsBenchmarkPct: 1.13, logoSrc: "/logos/aapl.svg" },
  { ticker: "MSFT", name: "Microsoft Corp", price: 428.15, currency: "USD", changeAbs: 3.92, changePct: 0.92, vsBenchmarkPct: -1.39, logoSrc: "/logos/msft.png" },
];
export const landingWatchlistReturn = 15.2;
