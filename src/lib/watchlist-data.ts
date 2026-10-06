import type { Direction } from "./format";

/** A watchlist row. Figures are null until the price job has data for the stock. */
export type Holding = {
  ticker: string;
  name: string;
  price: number | null;
  currency: string;
  changeAbs: number | null;
  changePct: number | null;
  /** Lead (+) or lag (-) against the benchmark over the selected range. */
  vsBenchmarkPct: number | null;
  logoSrc: string | null;
  /** A Twelve Data logo, for stocks outside the tracked set. */
  remoteLogo?: string | null;
  /** Outside the tracked set: its page fetches prices when rendered, so links to it must not prefetch. */
  untracked?: boolean;
};

export type WatchlistSummary = {
  /** Return of the watchlist as a whole, weighted by position size. */
  basketWeightedReturnPct: number;
  /** Median lead over the benchmark across every holding. */
  medianGapPct: number;
};

export type Standout = {
  ticker: string;
  name: string;
  todayPct: number;
  vsBenchmarkPct: number;
};

export type OverviewSummary = {
  benchmarkLabel: string;
  watchlistPct: number;
  leadPct: number;
  beating: number;
  total: number;
  range: string;
  bestVsMarket: Standout;
  greenButLagging: Standout;
};

/* ---------------------------------------------------------------------------
 * ILLUSTRATIONS FOR THE LANDING PAGE ONLY.
 *
 * `overview` and `holdings` are fixed example figures for the signed-out
 * product tour. Signed-in pages read the market snapshot instead.
 * ------------------------------------------------------------------------- */

export const overview: OverviewSummary = {
  benchmarkLabel: "S&P 500",
  watchlistPct: 15.2,
  leadPct: 1.59,
  beating: 4,
  total: 7,
  range: "YTD",
  bestVsMarket: {
    ticker: "NVDA",
    name: "NVIDIA Corp",
    todayPct: 3.83,
    vsBenchmarkPct: 1.11,
  },
  greenButLagging: {
    ticker: "MSFT",
    name: "Microsoft Corp",
    todayPct: 0.92,
    vsBenchmarkPct: -1.39,
  },
};

export const holdings: Holding[] = [
  { ticker: "AAPL", name: "Apple Inc.",     price: 309.23, currency: "USD", changeAbs: -1.08, changePct: -0.35, vsBenchmarkPct: 1.13,  logoSrc: "/logos/aapl.svg" },
  { ticker: "NVDA", name: "NVIDIA Corp",    price: 184.72, currency: "USD", changeAbs: 6.81,  changePct: 3.83,  vsBenchmarkPct: 1.11,  logoSrc: "/logos/nvda.png" },
  { ticker: "MSFT", name: "Microsoft Corp", price: 428.15, currency: "USD", changeAbs: 3.92,  changePct: 0.92,  vsBenchmarkPct: -1.39, logoSrc: "/logos/msft.png" },
  { ticker: "GOOGL", name: "Alphabet Inc.", price: 172.44, currency: "USD", changeAbs: -0.94, changePct: -0.54, vsBenchmarkPct: 0.42,  logoSrc: null },
  { ticker: "AMZN", name: "Amazon.com Inc.", price: 201.66, currency: "USD", changeAbs: 2.18, changePct: 1.09,  vsBenchmarkPct: -0.27, logoSrc: "/logos/amzn.png" },
  { ticker: "META", name: "Meta Platforms", price: 583.10, currency: "USD", changeAbs: -4.35, changePct: -0.74, vsBenchmarkPct: 2.06,  logoSrc: null },
  { ticker: "TSLA", name: "Tesla Inc.",     price: 241.88, currency: "USD", changeAbs: -3.12, changePct: -1.27, vsBenchmarkPct: -2.41, logoSrc: null },
];

export const watchlistSummary: WatchlistSummary = {
  basketWeightedReturnPct: 0.92,
  medianGapPct: 1.5,
};

export const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Compare", href: "/compare" },
  { label: "Explore", href: "/explore" },
];

export const ranges = ["1D", "1W", "1M", "YTD", "1Y"] as const;

export const chartMonths = ["Jan", "Mar", "May", "Jul", "Nov"];

export function directionClass(d: Direction): string {
  return d === "up" ? "text-up" : "text-down";
}
