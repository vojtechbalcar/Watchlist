import type { Period } from "./period-returns";

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

/** A stock the app tracks: identity only. Prices and returns come from the market snapshot. */
export type TrackedStock = {
  ticker: string;
  name: string;
  sector: Sector;
  currency: string;
  logoSrc: string | null;
};

/** A tracked stock with the market's current figures; any of them may be missing. */
export type ExploreStock = TrackedStock & {
  price: number | null;
  /** Today's move, in percent. */
  changePct: number | null;
  changeAbs: number | null;
  returns: Record<Period, number | null>;
  /** The same periods for the stock's sector benchmark. */
  benchmarkReturns: Record<Period, number | null>;
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

/**
 * A benchmark is labelled the way readers know it, but priced through a
 * tradeable ETF. Most sector labels already are the ETF's ticker.
 */
const benchmarkSymbols: Record<string, string> = { NASDAQ: "QQQ", "S&P 500": "SPY", "Dow Jones": "DIA", "Russell 2000": "IWM" };

export function benchmarkTicker(label: string): string {
  return benchmarkSymbols[label] ?? label;
}

/** The whole-market benchmark every watchlist is compared with. */
export const marketBenchmarkLabel = "S&P 500";

/** The dashboard's market bar. */
export const marketIndexLabels = ["S&P 500", "NASDAQ", "Dow Jones", "Russell 2000"];

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

/**
 * The stocks the app tracks and prices on a schedule, and what the database
 * seed creates Instrument rows from. Identity only: prices and returns come
 * from the market snapshot (src/lib/market.ts).
 */
export const trackedStocks: TrackedStock[] = [
  // Technology — vs NASDAQ
  { ticker: "MSFT",  name: "Microsoft Corp",      sector: "Technology",     currency: "USD", logoSrc: "/logos/msft.png" },
  { ticker: "AAPL",  name: "Apple Inc.",          sector: "Technology",     currency: "USD", logoSrc: "/logos/aapl.svg" },
  { ticker: "GOOGL", name: "Alphabet Inc.",       sector: "Technology",     currency: "USD", logoSrc: "/logos/googl.png" },
  { ticker: "META",  name: "Meta Platforms",      sector: "Technology",     currency: "USD", logoSrc: null },
  { ticker: "CRM",   name: "Salesforce Inc.",     sector: "Technology",     currency: "USD", logoSrc: null },
  { ticker: "ADBE",  name: "Adobe Inc.",          sector: "Technology",     currency: "USD", logoSrc: null },

  // Semiconductors — vs SOXX
  { ticker: "NVDA",  name: "NVIDIA Corp",         sector: "Semiconductors", currency: "USD", logoSrc: "/logos/nvda.png" },
  { ticker: "AMD",   name: "Advanced Micro Devices", sector: "Semiconductors", currency: "USD", logoSrc: "/logos/amd.png" },
  { ticker: "AVGO",  name: "Broadcom Inc",        sector: "Semiconductors", currency: "USD", logoSrc: "/logos/avgo.png" },
  { ticker: "TSM",   name: "Taiwan Semi",         sector: "Semiconductors", currency: "USD", logoSrc: null },
  { ticker: "QCOM",  name: "Qualcomm Inc.",       sector: "Semiconductors", currency: "USD", logoSrc: null },
  { ticker: "INTC",  name: "Intel Corp",          sector: "Semiconductors", currency: "USD", logoSrc: null },

  // Healthcare — vs XLV
  { ticker: "LLY",   name: "Eli Lilly & Co",      sector: "Healthcare",     currency: "USD", logoSrc: "/logos/lly.png" },
  { ticker: "UNH",   name: "UnitedHealth Group",  sector: "Healthcare",     currency: "USD", logoSrc: "/logos/unh.png" },
  { ticker: "JNJ",   name: "Johnson & Johnson",   sector: "Healthcare",     currency: "USD", logoSrc: null },
  { ticker: "ABBV",  name: "AbbVie Inc.",         sector: "Healthcare",     currency: "USD", logoSrc: null },
  { ticker: "MRK",   name: "Merck & Co.",         sector: "Healthcare",     currency: "USD", logoSrc: null },
  { ticker: "PFE",   name: "Pfizer Inc.",         sector: "Healthcare",     currency: "USD", logoSrc: null },

  // Financials — vs XLF
  { ticker: "JPM",   name: "JPMorgan Chase",      sector: "Financials",     currency: "USD", logoSrc: null },
  { ticker: "GS",    name: "Goldman Sachs",       sector: "Financials",     currency: "USD", logoSrc: null },
  { ticker: "BAC",   name: "Bank of America",     sector: "Financials",     currency: "USD", logoSrc: null },
  { ticker: "V",     name: "Visa Inc.",           sector: "Financials",     currency: "USD", logoSrc: null },
  { ticker: "MS",    name: "Morgan Stanley",      sector: "Financials",     currency: "USD", logoSrc: null },

  // Consumer — vs XLY
  { ticker: "AMZN",  name: "Amazon.com Inc.",     sector: "Consumer",       currency: "USD", logoSrc: "/logos/amzn.png" },
  { ticker: "COST",  name: "Costco Wholesale",    sector: "Consumer",       currency: "USD", logoSrc: null },
  { ticker: "HD",    name: "The Home Depot",      sector: "Consumer",       currency: "USD", logoSrc: null },
  { ticker: "NKE",   name: "Nike Inc.",           sector: "Consumer",       currency: "USD", logoSrc: null },
  { ticker: "SBUX",  name: "Starbucks Corp",      sector: "Consumer",       currency: "USD", logoSrc: null },

  // Energy — vs XLE
  { ticker: "XOM",   name: "Exxon Mobil",         sector: "Energy",         currency: "USD", logoSrc: null },
  { ticker: "CVX",   name: "Chevron Corp",        sector: "Energy",         currency: "USD", logoSrc: null },
  { ticker: "COP",   name: "ConocoPhillips",      sector: "Energy",         currency: "USD", logoSrc: null },
  { ticker: "SLB",   name: "SLB Ltd.",            sector: "Energy",         currency: "USD", logoSrc: null },
  { ticker: "EOG",   name: "EOG Resources",       sector: "Energy",         currency: "USD", logoSrc: null },

  // Industrials — vs XLI
  { ticker: "CAT",   name: "Caterpillar Inc.",    sector: "Industrials",    currency: "USD", logoSrc: null },
  { ticker: "BA",    name: "Boeing Co",           sector: "Industrials",    currency: "USD", logoSrc: null },
  { ticker: "HON",   name: "Honeywell International", sector: "Industrials", currency: "USD", logoSrc: null },
  { ticker: "UPS",   name: "United Parcel Service", sector: "Industrials",  currency: "USD", logoSrc: null },
  { ticker: "DE",    name: "Deere & Co.",         sector: "Industrials",    currency: "USD", logoSrc: null },

  // Utilities — vs XLU
  { ticker: "NEE",   name: "NextEra Energy",      sector: "Utilities",      currency: "USD", logoSrc: null },
  { ticker: "DUK",   name: "Duke Energy",         sector: "Utilities",      currency: "USD", logoSrc: null },
  { ticker: "SO",    name: "Southern Company",    sector: "Utilities",      currency: "USD", logoSrc: null },
  { ticker: "AEP",   name: "American Electric Power", sector: "Utilities",  currency: "USD", logoSrc: null },
  { ticker: "EXC",   name: "Exelon Corp",         sector: "Utilities",      currency: "USD", logoSrc: null },

  // Real Estate — vs XLRE
  { ticker: "AMT",   name: "American Tower",      sector: "Real Estate",    currency: "USD", logoSrc: null },
  { ticker: "PLD",   name: "Prologis Inc.",       sector: "Real Estate",    currency: "USD", logoSrc: null },
  { ticker: "EQIX",  name: "Equinix Inc.",        sector: "Real Estate",    currency: "USD", logoSrc: null },
  { ticker: "O",     name: "Realty Income",       sector: "Real Estate",    currency: "USD", logoSrc: null },
  { ticker: "SPG",   name: "Simon Property Group", sector: "Real Estate",   currency: "USD", logoSrc: null },
];

export function benchmarkFor(stock: TrackedStock): string {
  return sectorBenchmarks[stock.sector];
}
