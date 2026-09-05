import { holdings, type Holding } from "./watchlist-data";

export type CompareRange = "1D" | "1W" | "1M" | "YTD" | "1Y";

export const compareRanges: CompareRange[] = ["1D", "1W", "1M", "YTD", "1Y"];

export type CompareSeries = {
  ticker: string;
  /** Total return over each range, in percent. */
  returnByRange: Record<CompareRange, number>;
  /** Which of the series colours this stock owns, so its line, its pill dot
   *  and its table dot never disagree. */
  colorVar: string;
  /** Placeholder geometry in the chart's 1538x375 viewBox. */
  path: string;
};

/* ---------------------------------------------------------------------------
 * PLACEHOLDER DATA.
 *
 * Same rule as watchlist-data.ts: nothing here touches a data source. Returns
 * are made up but internally consistent — every figure the Compare page shows
 * is derived from `returnByRange` below, never typed in twice.
 *
 * Known gap: the series `path` values are the exact curves exported from
 * Figma and do not vary by range, so switching the range moves the numbers
 * without redrawing the lines. Per-range geometry arrives with the price
 * history in Postgres, at which point these `d` strings get generated.
 * ------------------------------------------------------------------------- */

export const compareBenchmark = {
  label: "S&P 500",
  returnByRange: { "1D": 0.31, "1W": 1.12, "1M": 2.65, YTD: 14.6, "1Y": 18.4 },
  path: "M0.657041 372.92L216.157 305.42L387.657 294.92L619.157 260.92L786.157 243.42L999.157 217.92L1168.16 200.92L1353.66 164.92L1531.16 125.42",
};

/** The stocks the Compare page can chart. Adding one beyond this set needs a
 *  series to draw, so the picker offers exactly these. */
export const compareSeries: CompareSeries[] = [
  {
    ticker: "NVDA",
    returnByRange: { "1D": 3.83, "1W": 5.4, "1M": 9.2, YTD: 42.0, "1Y": 61.3 },
    colorVar: "var(--color-series-1)",
    path: "M1525.66 1.92009L944.157 171.42L810.157 188.92L565.657 248.92L377.657 262.42L196.157 304.92L0.657041 372.92",
  },
  {
    ticker: "MSFT",
    returnByRange: { "1D": 0.22, "1W": 1.35, "1M": 2.1, YTD: 15.9, "1Y": 21.7 },
    colorVar: "var(--color-series-2)",
    path: "M0.657041 372.92L156.157 344.92L211.157 335.92L649.157 310.92L788.657 304.92L1161.16 279.42L1537.66 224.92",
  },
  {
    ticker: "AMZN",
    returnByRange: { "1D": 1.09, "1W": 2.05, "1M": 4.4, YTD: 19.0, "1Y": 24.8 },
    colorVar: "var(--color-series-3)",
    path: "M1532.66 200.92L1323.16 243.92L944.157 289.92L802.657 299.92L633.657 315.42L196.157 346.42L0.657041 372.92",
  },
];

export const compareMonths = ["Jan", "Mar", "May", "Jul", "Nov"];

export type CompareRow = {
  series: CompareSeries;
  holding: Holding;
  /** The stock's own return over the range. */
  returnPct: number;
  /** Lead (+) or lag (-) against the benchmark, in percentage points. */
  vsBenchmarkPct: number;
  /** Lead or lag against each other selected stock, keyed by ticker. `null`
   *  where a stock meets itself — the cell the design leaves as a dash. */
  vsPeers: Record<string, number | null>;
};

/**
 * Every number the page shows, derived from one range and one selection.
 *
 * A gap is a difference of returns in percentage points, which is how the
 * design reads the vs-benchmark column: NVDA +42.00 against a benchmark of
 * +14.60 is quoted as +27.40. The peer columns use the same rule, so the
 * matrix is antisymmetric — A vs B is always exactly -(B vs A).
 */
export function compareRows(range: CompareRange, selected: string[]): CompareRow[] {
  const chosen = compareSeries.filter((s) => selected.includes(s.ticker));
  const benchmarkReturn = compareBenchmark.returnByRange[range];

  return chosen.map((series) => {
    const returnPct = series.returnByRange[range];
    const holding = holdings.find((h) => h.ticker === series.ticker);

    if (!holding) {
      throw new Error(`Compare series ${series.ticker} is not in the watchlist.`);
    }

    return {
      series,
      holding,
      returnPct,
      vsBenchmarkPct: round(returnPct - benchmarkReturn),
      vsPeers: Object.fromEntries(
        chosen.map((peer) => [
          peer.ticker,
          peer.ticker === series.ticker
            ? null
            : round(returnPct - peer.returnByRange[range]),
        ]),
      ),
    };
  });
}

/** Percentage points carry two decimals; float subtraction does not. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
