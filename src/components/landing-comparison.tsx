"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CompareChart } from "./compare-chart";
import { StockLogo } from "./stock-logo";
import { compareBenchmark, compareRows, compareSeries, type CompareRange } from "@/lib/compare-data";
import { formatPct } from "@/lib/format";
import styles from "@/app/landing.module.css";

const ranges: CompareRange[] = ["1M", "YTD", "1Y"];

export function LandingComparison() {
  const [ticker, setTicker] = useState("MSFT");
  const [range, setRange] = useState<CompareRange>("1M");
  const [row] = compareRows(range, [ticker]);
  const ahead = row.vsBenchmarkPct >= 0;
  const Direction = ahead ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={styles.comparison}>
      <div className={styles.comparisonToolbar}>
        <div className={styles.stockChoices} role="group" aria-label="Example stock">
          {compareSeries.map((series) => (
            <button
              key={series.ticker}
              type="button"
              aria-pressed={ticker === series.ticker}
              onClick={() => setTicker(series.ticker)}
            >
              {series.ticker}
            </button>
          ))}
        </div>
        <div className={styles.rangeChoices} role="group" aria-label="Example period">
          {ranges.map((period) => (
            <button key={period} type="button" aria-pressed={range === period} onClick={() => setRange(period)}>
              {period}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.comparisonBody}>
        <div className={styles.exampleChart}>
          <dl className={styles.exampleMetrics}>
            <div>
              <dt><StockLogo stock={row.holding} /> {row.holding.name}</dt>
              <dd>{formatPct(row.returnPct)}</dd>
            </div>
            <div>
              <dt><span className={styles.benchmarkMark} aria-hidden="true" /> {compareBenchmark.label}</dt>
              <dd>{formatPct(compareBenchmark.returnByRange[range])}</dd>
            </div>
          </dl>
          <CompareChart rows={[row]} benchmarkLabel={compareBenchmark.label} range={range} />
        </div>
        <div className={styles.exampleVerdict} role="status" aria-live="polite" aria-atomic="true">
          <span className={styles.label}>The difference</span>
          <p className={ahead ? styles.ahead : styles.behind}>
            <Direction size={24} aria-hidden="true" />
            <strong>{Math.abs(row.vsBenchmarkPct).toFixed(2)}<small> pp</small></strong>
          </p>
          <h3>{ahead ? "Ahead of the market." : "Up. But behind the market."}</h3>
          <p>
            {ticker} gained {formatPct(row.returnPct)}, while the {compareBenchmark.label} gained{" "}
            {formatPct(compareBenchmark.returnByRange[range])} over the same period.
          </p>
          <span className={styles.exampleNote}>Illustrative data &middot; {range}</span>
        </div>
      </div>
      <div className={styles.exampleCaption}>
        <span>Same period. Same starting point. A clearer comparison.</span>
        <span>Demo returns, not live prices</span>
      </div>
    </div>
  );
}
