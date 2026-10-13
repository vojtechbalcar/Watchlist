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
