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

export const sectorDescriptions: Record<Sector, string> = {
  Technology: "Software, platforms, and the companies connecting everyday life.",
  Semiconductors: "The chips and computing power behind the digital economy.",
  Healthcare: "From new treatments to the care people depend on.",
  Financials: "Banking, payments, and the businesses moving money.",
  Consumer: "The brands, retailers, and services in everyday spending.",
  Energy: "The producers and services powering the world.",
  Industrials: "The makers, movers, and builders of the economy.",
  Utilities: "The essential services that keep cities running.",
  "Real Estate": "The places we live, work, shop, and connect.",
};

export function sectorSlug(sector: Sector): string {
  return sector.toLowerCase().replaceAll(" ", "-");
}

export function sectorFromSlug(slug: string): Sector | undefined {
  return sectors.find(sector => sectorSlug(sector) === slug);
}

/** Display order for the stacked sector sections. */
export const sectors: Sector[] = [
  "Technology",
  "Semiconductors",
  "Healthcare",
  "Financials",
  "Consumer",
  "Energy",
  "Industrials",
  "Utilities",
  "Real Estate",
];

/* ---------------------------------------------------------------------------
 * PLACEHOLDER DATA.
 *
 * Same rule as watchlist-data.ts and compare-data.ts: nothing here touches a
 * data source. Sector counts, previews, and category pages are derived from
 * this list. Additional fixtures let each category show a four-stock preview
 * with more stocks on its dedicated page. Values are illustrative, not quotes.
 * ------------------------------------------------------------------------- */

export const exploreUniverse: ExploreStock[] = [
  // Technology — vs NASDAQ
  { ticker: "MSFT",  name: "Microsoft Corp",      sector: "Technology",     price: 418.59,  currency: "USD", changePct: 0.92,  vsBenchmarkPct: -1.39, logoSrc: "/logos/msft.png" },
  { ticker: "AAPL",  name: "Apple Inc.",          sector: "Technology",     price: 231.48,  currency: "USD", changePct: 2.44,  vsBenchmarkPct: 0.13,  logoSrc: "/logos/aapl.svg" },
  { ticker: "GOOGL", name: "Alphabet Inc.",       sector: "Technology",     price: 159.2,   currency: "USD", changePct: 1.5,   vsBenchmarkPct: 0.88,  logoSrc: "/logos/googl.png" },
  { ticker: "META",  name: "Meta Platforms",      sector: "Technology",     price: 583.1,   currency: "USD", changePct: 1.18,  vsBenchmarkPct: 0.42,  logoSrc: null },
  { ticker: "CRM",   name: "Salesforce Inc.",     sector: "Technology",     price: 258.4,   currency: "USD", changePct: 0.72,  vsBenchmarkPct: -0.34, logoSrc: null },
  { ticker: "ADBE",  name: "Adobe Inc.",          sector: "Technology",     price: 514.2,   currency: "USD", changePct: -0.46, vsBenchmarkPct: -1.08, logoSrc: null },

  // Semiconductors — vs SOXX
  { ticker: "NVDA",  name: "NVIDIA Corp",         sector: "Semiconductors", price: 210.84,  currency: "USD", changePct: 3.44,  vsBenchmarkPct: 1.13,  logoSrc: "/logos/nvda.png" },
  { ticker: "AMD",   name: "Advanced Micro Devices", sector: "Semiconductors", price: 159.84, currency: "USD", changePct: 2.1, vsBenchmarkPct: -0.59, logoSrc: "/logos/amd.png" },
  { ticker: "AVGO",  name: "Broadcom Inc",        sector: "Semiconductors", price: 1642.3,  currency: "USD", changePct: 1.55,  vsBenchmarkPct: 0.88,  logoSrc: "/logos/avgo.png" },
  { ticker: "TSM",   name: "Taiwan Semi",         sector: "Semiconductors", price: 184.22,  currency: "USD", changePct: 1.02,  vsBenchmarkPct: 0.31,  logoSrc: null },
  { ticker: "QCOM",  name: "Qualcomm Inc.",       sector: "Semiconductors", price: 172.6,   currency: "USD", changePct: 0.86,  vsBenchmarkPct: 0.15,  logoSrc: null },
  { ticker: "INTC",  name: "Intel Corp",          sector: "Semiconductors", price: 24.8,    currency: "USD", changePct: -0.92, vsBenchmarkPct: -1.63, logoSrc: null },

  // Healthcare — vs XLV
  { ticker: "LLY",   name: "Eli Lilly & Co",      sector: "Healthcare",     price: 884.1,   currency: "USD", changePct: 1.32,  vsBenchmarkPct: 1.94,  logoSrc: "/logos/lly.png" },
  { ticker: "UNH",   name: "UnitedHealth Group",  sector: "Healthcare",     price: 312.07,  currency: "USD", changePct: 3.02,  vsBenchmarkPct: 0.71,  logoSrc: "/logos/unh.png" },
  { ticker: "JNJ",   name: "Johnson & Johnson",   sector: "Healthcare",     price: 162.55,  currency: "USD", changePct: -0.34, vsBenchmarkPct: -0.88, logoSrc: null },
  { ticker: "ABBV",  name: "AbbVie Inc.",         sector: "Healthcare",     price: 193.4,   currency: "USD", changePct: 0.67,  vsBenchmarkPct: 0.13,  logoSrc: null },
  { ticker: "MRK",   name: "Merck & Co.",         sector: "Healthcare",     price: 114.8,   currency: "USD", changePct: -0.28, vsBenchmarkPct: -0.82, logoSrc: null },
  { ticker: "PFE",   name: "Pfizer Inc.",         sector: "Healthcare",     price: 28.6,    currency: "USD", changePct: 0.42,  vsBenchmarkPct: -0.12, logoSrc: null },

  // Financials — vs XLF
  { ticker: "JPM",   name: "JPMorgan Chase",      sector: "Financials",     price: 224.16,  currency: "USD", changePct: 0.41,  vsBenchmarkPct: 0.35,  logoSrc: null },
  { ticker: "GS",    name: "Goldman Sachs",       sector: "Financials",     price: 512.7,   currency: "USD", changePct: 0.88,  vsBenchmarkPct: 0.62,  logoSrc: null },
  { ticker: "BAC",   name: "Bank of America",     sector: "Financials",     price: 42.18,   currency: "USD", changePct: -0.51, vsBenchmarkPct: -0.74, logoSrc: null },
  { ticker: "V",     name: "Visa Inc.",           sector: "Financials",     price: 284.6,   currency: "USD", changePct: 0.76,  vsBenchmarkPct: 0.53,  logoSrc: null },
  { ticker: "MS",    name: "Morgan Stanley",      sector: "Financials",     price: 106.3,   currency: "USD", changePct: -0.18, vsBenchmarkPct: -0.41, logoSrc: null },

  // Consumer — vs XLY
  { ticker: "AMZN",  name: "Amazon.com Inc.",     sector: "Consumer",       price: 201.66,  currency: "USD", changePct: 1.09,  vsBenchmarkPct: 0.24,  logoSrc: "/logos/amzn.png" },
  { ticker: "COST",  name: "Costco Wholesale",    sector: "Consumer",       price: 902.15,  currency: "USD", changePct: 2.85,  vsBenchmarkPct: 1.41,  logoSrc: null },
  { ticker: "HD",    name: "The Home Depot",      sector: "Consumer",       price: 374.2,   currency: "USD", changePct: 0.62,  vsBenchmarkPct: -0.23, logoSrc: null },
  { ticker: "NKE",   name: "Nike Inc.",           sector: "Consumer",       price: 81.4,    currency: "USD", changePct: -0.73, vsBenchmarkPct: -1.58, logoSrc: null },
  { ticker: "SBUX",  name: "Starbucks Corp",      sector: "Consumer",       price: 94.6,    currency: "USD", changePct: 1.12,  vsBenchmarkPct: 0.27,  logoSrc: null },

  // Energy — vs XLE
  { ticker: "XOM",   name: "Exxon Mobil",         sector: "Energy",         price: 118.4,   currency: "USD", changePct: 0.64,  vsBenchmarkPct: -0.22, logoSrc: null },
  { ticker: "CVX",   name: "Chevron Corp",        sector: "Energy",         price: 154.9,   currency: "USD", changePct: -0.28, vsBenchmarkPct: -0.51, logoSrc: null },
  { ticker: "COP",   name: "ConocoPhillips",      sector: "Energy",         price: 111.3,   currency: "USD", changePct: 0.18,  vsBenchmarkPct: -0.05, logoSrc: null },
  { ticker: "SLB",   name: "SLB Ltd.",            sector: "Energy",         price: 44.6,    currency: "USD", changePct: -0.62, vsBenchmarkPct: -0.85, logoSrc: null },
  { ticker: "EOG",   name: "EOG Resources",       sector: "Energy",         price: 126.8,   currency: "USD", changePct: 0.12,  vsBenchmarkPct: -0.11, logoSrc: null },

  // Industrials — vs XLI
  { ticker: "CAT",   name: "Caterpillar Inc.",    sector: "Industrials",    price: 391.05,  currency: "USD", changePct: 1.44,  vsBenchmarkPct: 0.67,  logoSrc: null },
  { ticker: "BA",    name: "Boeing Co",           sector: "Industrials",    price: 178.62,  currency: "USD", changePct: -1.12, vsBenchmarkPct: -1.85, logoSrc: null },
  { ticker: "HON",   name: "Honeywell International", sector: "Industrials", price: 207.4, currency: "USD", changePct: 0.92, vsBenchmarkPct: 0.19, logoSrc: null },
  { ticker: "UPS",   name: "United Parcel Service", sector: "Industrials",  price: 132.6,   currency: "USD", changePct: -0.31, vsBenchmarkPct: -1.04, logoSrc: null },
  { ticker: "DE",    name: "Deere & Co.",         sector: "Industrials",    price: 389.2,   currency: "USD", changePct: 1.06,  vsBenchmarkPct: 0.33,  logoSrc: null },

  // Utilities — vs XLU
  { ticker: "NEE",   name: "NextEra Energy",      sector: "Utilities",      price: 79.34,   currency: "USD", changePct: 0.18,  vsBenchmarkPct: -0.29, logoSrc: null },
  { ticker: "DUK",   name: "Duke Energy",         sector: "Utilities",      price: 114.2,   currency: "USD", changePct: 0.63,  vsBenchmarkPct: 0.16,  logoSrc: null },
  { ticker: "SO",    name: "Southern Company",    sector: "Utilities",      price: 87.6,    currency: "USD", changePct: 0.36,  vsBenchmarkPct: -0.11, logoSrc: null },
  { ticker: "AEP",   name: "American Electric Power", sector: "Utilities",  price: 101.4,   currency: "USD", changePct: -0.12, vsBenchmarkPct: -0.59, logoSrc: null },
  { ticker: "EXC",   name: "Exelon Corp",         sector: "Utilities",      price: 39.8,    currency: "USD", changePct: 0.58,  vsBenchmarkPct: 0.11,  logoSrc: null },

  // Real Estate — vs XLRE
  { ticker: "AMT",   name: "American Tower",      sector: "Real Estate",    price: 214.77,  currency: "USD", changePct: 0.96,  vsBenchmarkPct: 0.52,  logoSrc: null },
  { ticker: "PLD",   name: "Prologis Inc.",       sector: "Real Estate",    price: 124.3,   currency: "USD", changePct: 0.68,  vsBenchmarkPct: 0.24,  logoSrc: null },
  { ticker: "EQIX",  name: "Equinix Inc.",        sector: "Real Estate",    price: 834.6,   currency: "USD", changePct: 1.12,  vsBenchmarkPct: 0.68,  logoSrc: null },
  { ticker: "O",     name: "Realty Income",       sector: "Real Estate",    price: 61.2,    currency: "USD", changePct: -0.21, vsBenchmarkPct: -0.65, logoSrc: null },
  { ticker: "SPG",   name: "Simon Property Group", sector: "Real Estate",   price: 168.4,   currency: "USD", changePct: 0.32,  vsBenchmarkPct: -0.12, logoSrc: null },
];

export function benchmarkFor(stock: ExploreStock): string {
  return sectorBenchmarks[stock.sector];
}
