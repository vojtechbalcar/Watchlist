import type { ExploreStock, Sector } from "./explore-data";

export const exploreRanges = ["1D", "1W", "1M", "YTD", "1Y"] as const;
export type ExploreRange = (typeof exploreRanges)[number];
type PeriodReturns = Record<ExploreRange, number>;

// Illustrative fixtures, not fetched prices or historical returns. Each sector
// shares one benchmark series, so every displayed gap uses the same baseline.
export const sectorReturns: Record<Sector, PeriodReturns> = {
  Technology: { "1D": 0.62, "1W": 1.12, "1M": 2.65, YTD: 14.6, "1Y": 18.4 },
  Semiconductors: { "1D": 2.31, "1W": 3.8, "1M": 6.4, YTD: 24.8, "1Y": 32.6 },
  Healthcare: { "1D": 0.54, "1W": -0.45, "1M": 1.2, YTD: 5.6, "1Y": 8.2 },
  Financials: { "1D": 0.06, "1W": 0.9, "1M": 2.8, YTD: 12.3, "1Y": 20.1 },
  Consumer: { "1D": 0.85, "1W": 1.4, "1M": -0.8, YTD: 9.7, "1Y": 15.2 },
  Energy: { "1D": 0.23, "1W": -1.6, "1M": -3.2, YTD: 4.1, "1Y": 6.8 },
  Industrials: { "1D": 0.77, "1W": 0.6, "1M": 1.9, YTD: 10.4, "1Y": 16.3 },
  Utilities: { "1D": 0.47, "1W": -0.2, "1M": 0.8, YTD: 7.5, "1Y": 11.6 },
  "Real Estate": { "1D": 0.44, "1W": -0.7, "1M": 1.1, YTD: 3.8, "1Y": 7.9 },
};

// Weekly, monthly, year-to-date, and yearly returns are independent fixtures.
// Daily returns come from the existing stock snapshot.
const stockReturns: Partial<Record<string, Record<Exclude<ExploreRange, "1D">, number>>> = {
  MSFT: { "1W": 1.5, "1M": 4.1, YTD: 13.21, "1Y": 23.7 },
  AAPL: { "1W": -0.3, "1M": 1.8, YTD: 15.73, "1Y": 16.9 },
  GOOGL: { "1W": 2.4, "1M": 5.6, YTD: 18.2, "1Y": 26.4 },
  META: { "1W": 1.8, "1M": 3.2, YTD: 21.5, "1Y": 28.1 },
  NVDA: { "1W": 5.6, "1M": 9.8, YTD: 31.2, "1Y": 45.3 },
  AMD: { "1W": 2.1, "1M": 4.5, YTD: 17.9, "1Y": 25.6 },
  AVGO: { "1W": 4.4, "1M": 7.3, YTD: 28.4, "1Y": 38.2 },
  TSM: { "1W": 3.2, "1M": 5.8, YTD: 26.1, "1Y": 34.7 },
  LLY: { "1W": 1.6, "1M": 3.8, YTD: 16.4, "1Y": 24.8 },
  UNH: { "1W": -2.2, "1M": -4.6, YTD: -8.3, "1Y": -12.5 },
  JNJ: { "1W": -0.8, "1M": 0.5, YTD: 4.2, "1Y": 6.1 },
  JPM: { "1W": 1.7, "1M": 4.2, YTD: 18.6, "1Y": 27.4 },
  GS: { "1W": 1.3, "1M": 3.7, YTD: 15.4, "1Y": 23.8 },
  BAC: { "1W": -0.4, "1M": 1.6, YTD: 8.9, "1Y": 14.2 },
  AMZN: { "1W": 2.6, "1M": 0.9, YTD: 15.3, "1Y": 22.7 },
  COST: { "1W": 0.8, "1M": -1.4, YTD: 8.1, "1Y": 13.6 },
  XOM: { "1W": -0.9, "1M": -2.1, YTD: 6.7, "1Y": 9.4 },
  CVX: { "1W": -2.3, "1M": -4.5, YTD: 1.8, "1Y": 4.2 },
  CAT: { "1W": 1.4, "1M": 3.6, YTD: 14.9, "1Y": 22.1 },
  BA: { "1W": -1.1, "1M": -0.8, YTD: -3.2, "1Y": 7.6 },
  NEE: { "1W": 0.5, "1M": 1.9, YTD: 10.3, "1Y": 15.8 },
  AMT: { "1W": -0.2, "1M": 2.4, YTD: 6.1, "1Y": 10.7 },
  CRM: { "1W": 0.7, "1M": 1.8, YTD: 11.2, "1Y": 15.6 },
  ADBE: { "1W": -0.5, "1M": -2.4, YTD: 5.1, "1Y": 9.2 },
  QCOM: { "1W": 2.7, "1M": 7.2, YTD: 20.6, "1Y": 35.1 },
  INTC: { "1W": -1.8, "1M": -4.6, YTD: -11.3, "1Y": -15.2 },
  ABBV: { "1W": 0.2, "1M": 2.1, YTD: 9.3, "1Y": 12.5 },
  MRK: { "1W": -1.2, "1M": -0.4, YTD: 3.2, "1Y": 7.4 },
  PFE: { "1W": -0.3, "1M": 1.2, YTD: -2.1, "1Y": 4.7 },
  V: { "1W": 1.1, "1M": 3.4, YTD: 14.8, "1Y": 22.6 },
  MS: { "1W": -0.2, "1M": 1.9, YTD: 10.2, "1Y": 17.8 },
  HD: { "1W": 0.6, "1M": -1.7, YTD: 8.4, "1Y": 12.1 },
  NKE: { "1W": -1.2, "1M": -3.9, YTD: -6.2, "1Y": -8.7 },
  SBUX: { "1W": 1.8, "1M": 0.4, YTD: 10.6, "1Y": 17.3 },
  COP: { "1W": -1.1, "1M": -2.7, YTD: 5.2, "1Y": 8.1 },
  SLB: { "1W": -2.6, "1M": -5.1, YTD: -1.4, "1Y": 3.7 },
  EOG: { "1W": -1.4, "1M": -3.2, YTD: 4.6, "1Y": 7.2 },
  HON: { "1W": 0.8, "1M": 2.7, YTD: 12.1, "1Y": 19.4 },
  UPS: { "1W": -0.7, "1M": -1.3, YTD: 6.8, "1Y": 10.2 },
  DE: { "1W": 1.2, "1M": 3.1, YTD: 13.7, "1Y": 21.3 },
  DUK: { "1W": 0.1, "1M": 1.6, YTD: 9.4, "1Y": 13.8 },
  SO: { "1W": -0.4, "1M": 0.5, YTD: 6.9, "1Y": 10.5 },
  AEP: { "1W": -0.8, "1M": -0.3, YTD: 5.4, "1Y": 8.2 },
  EXC: { "1W": 0.3, "1M": 1.3, YTD: 8.1, "1Y": 12.4 },
  PLD: { "1W": -0.3, "1M": 1.9, YTD: 5.7, "1Y": 10.1 },
  EQIX: { "1W": 0.2, "1M": 3.4, YTD: 9.6, "1Y": 14.8 },
  O: { "1W": -1.1, "1M": -0.5, YTD: 1.6, "1Y": 5.3 },
  SPG: { "1W": -0.6, "1M": 0.8, YTD: 3.4, "1Y": 7.2 },
};

export function explorePerformance(stock: ExploreStock, range: ExploreRange) {
  const stockReturn = range === "1D" ? stock.changePct : stockReturns[stock.ticker]?.[range];
  if (stockReturn === undefined) return null;
  const benchmarkReturn = sectorReturns[stock.sector][range];
  return {
    stockReturn,
    benchmarkReturn,
    gap: Number((stockReturn - benchmarkReturn).toFixed(2)),
  };
}

export type ExplorePerformance = NonNullable<ReturnType<typeof explorePerformance>>;
