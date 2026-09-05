export type Sector =
  | "Technology"
  | "Semiconductors"
  | "Healthcare"
  | "Financials"
  | "Consumer"
  | "Energy"
  | "Industrials"
  | "Utilities"
  | "Real Estate";

export type ExploreStock = {
  ticker: string;
  name: string;
  sector: Sector;
  price: number;
  currency: string;
  /** Today's move, in percent. */
  changePct: number;
  /** Lead (+) or lag (-) against the stock's sector index today. */
  vsBenchmarkPct: number;
  logoSrc: string | null;
  /** The one card the grid gives a double-width slot to. Editorial, not
   *  derived — the design features exactly one per grid. */
  featured?: boolean;
};

/**
 * Each sector is measured against its own index. That is what "measured
 * against the market" means on this page: a semiconductor is judged against
 * semiconductors, not against the S&P 500.
 */
export const sectorBenchmarks: Record<Sector, string> = {
  Technology: "NASDAQ",
  Semiconductors: "SOXX",
  Healthcare: "XLV",
  Financials: "XLF",
  Consumer: "XLY",
  Energy: "XLE",
  Industrials: "XLI",
  Utilities: "XLU",
  "Real Estate": "XLRE",
};

/** Shown in the pill row; the rest sit behind "More". */
export const primarySectors: Sector[] = [
  "Technology",
  "Semiconductors",
  "Healthcare",
  "Financials",
  "Consumer",
  "Energy",
];

export const moreSectors: Sector[] = ["Industrials", "Utilities", "Real Estate"];

/* ---------------------------------------------------------------------------
 * PLACEHOLDER DATA.
 *
 * Same rule as watchlist-data.ts and compare-data.ts: nothing here touches a
 * data source. Every count and every headline on the Explore page is derived
 * from this list — the "N of M beating their market" line and the hero stock
 * are computed, never typed.
 * ------------------------------------------------------------------------- */

export const exploreUniverse: ExploreStock[] = [
  // Technology — vs NASDAQ
  { ticker: "MSFT",  name: "Microsoft Corp",      sector: "Technology",     price: 418.59,  currency: "USD", changePct: 0.92,  vsBenchmarkPct: -1.39, logoSrc: "/logos/msft.png" },
  { ticker: "AAPL",  name: "Apple Inc.",          sector: "Technology",     price: 231.48,  currency: "USD", changePct: 2.44,  vsBenchmarkPct: 0.13,  logoSrc: "/logos/aapl.svg" },
  { ticker: "GOOGL", name: "Alphabet Inc.",       sector: "Technology",     price: 159.2,   currency: "USD", changePct: 1.5,   vsBenchmarkPct: 0.88,  logoSrc: "/logos/googl.png", featured: true },
  { ticker: "META",  name: "Meta Platforms",      sector: "Technology",     price: 583.1,   currency: "USD", changePct: 1.18,  vsBenchmarkPct: 0.42,  logoSrc: null },

  // Semiconductors — vs SOXX
  { ticker: "NVDA",  name: "NVIDIA Corp",         sector: "Semiconductors", price: 210.84,  currency: "USD", changePct: 3.44,  vsBenchmarkPct: 1.13,  logoSrc: "/logos/nvda.png" },
  { ticker: "AMD",   name: "Advanced Micro D...", sector: "Semiconductors", price: 159.84,  currency: "USD", changePct: 2.1,   vsBenchmarkPct: -0.59, logoSrc: "/logos/amd.png" },
  { ticker: "AVGO",  name: "Broadcom Inc",        sector: "Semiconductors", price: 1642.3,  currency: "USD", changePct: 1.55,  vsBenchmarkPct: 0.88,  logoSrc: "/logos/avgo.png" },
  { ticker: "TSM",   name: "Taiwan Semi",         sector: "Semiconductors", price: 184.22,  currency: "USD", changePct: 1.02,  vsBenchmarkPct: 0.31,  logoSrc: null },

  // Healthcare — vs XLV
  { ticker: "LLY",   name: "Eli Lilly & Co",      sector: "Healthcare",     price: 884.1,   currency: "USD", changePct: 1.32,  vsBenchmarkPct: 1.94,  logoSrc: "/logos/lly.png" },
  { ticker: "UNH",   name: "UnitedHealth Group",  sector: "Healthcare",     price: 312.07,  currency: "USD", changePct: 3.02,  vsBenchmarkPct: 0.71,  logoSrc: "/logos/unh.png" },
  { ticker: "JNJ",   name: "Johnson & Johnson",   sector: "Healthcare",     price: 162.55,  currency: "USD", changePct: -0.34, vsBenchmarkPct: -0.88, logoSrc: null },

  // Financials — vs XLF
  { ticker: "JPM",   name: "JPMorgan Chase",      sector: "Financials",     price: 224.16,  currency: "USD", changePct: 0.41,  vsBenchmarkPct: 0.35,  logoSrc: null },
  { ticker: "GS",    name: "Goldman Sachs",       sector: "Financials",     price: 512.7,   currency: "USD", changePct: 0.88,  vsBenchmarkPct: 0.62,  logoSrc: null },
  { ticker: "BAC",   name: "Bank of America",     sector: "Financials",     price: 42.18,   currency: "USD", changePct: -0.51, vsBenchmarkPct: -0.74, logoSrc: null },

  // Consumer — vs XLY
  { ticker: "AMZN",  name: "Amazon.com Inc.",     sector: "Consumer",       price: 201.66,  currency: "USD", changePct: 1.09,  vsBenchmarkPct: 0.24,  logoSrc: "/logos/amzn.png" },
  { ticker: "COST",  name: "Costco Wholesale",    sector: "Consumer",       price: 902.15,  currency: "USD", changePct: 2.85,  vsBenchmarkPct: 1.41,  logoSrc: null },

  // Energy — vs XLE
  { ticker: "XOM",   name: "Exxon Mobil",         sector: "Energy",         price: 118.4,   currency: "USD", changePct: 0.64,  vsBenchmarkPct: -0.22, logoSrc: null },
  { ticker: "CVX",   name: "Chevron Corp",        sector: "Energy",         price: 154.9,   currency: "USD", changePct: -0.28, vsBenchmarkPct: -0.51, logoSrc: null },

  // Behind "More"
  { ticker: "CAT",   name: "Caterpillar Inc.",    sector: "Industrials",    price: 391.05,  currency: "USD", changePct: 1.44,  vsBenchmarkPct: 0.67,  logoSrc: null },
  { ticker: "BA",    name: "Boeing Co",           sector: "Industrials",    price: 178.62,  currency: "USD", changePct: -1.12, vsBenchmarkPct: -1.85, logoSrc: null },
  { ticker: "NEE",   name: "NextEra Energy",      sector: "Utilities",      price: 79.34,   currency: "USD", changePct: 0.18,  vsBenchmarkPct: -0.29, logoSrc: null },
  { ticker: "AMT",   name: "American Tower",      sector: "Real Estate",    price: 214.77,  currency: "USD", changePct: 0.96,  vsBenchmarkPct: 0.52,  logoSrc: null },
];

/** The stock the hero slot promotes: today's biggest lead over its own index. */
export function biggestMarketBeater(stocks: ExploreStock[]): ExploreStock | undefined {
  return stocks.reduce<ExploreStock | undefined>(
    (best, stock) =>
      best === undefined || stock.vsBenchmarkPct > best.vsBenchmarkPct ? stock : best,
    undefined,
  );
}

export function benchmarkFor(stock: ExploreStock): string {
  return sectorBenchmarks[stock.sector];
}
