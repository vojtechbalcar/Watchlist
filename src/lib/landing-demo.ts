import type { ExploreStock } from "./explore-data";
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
