"use client";

import { alignTo } from "@/lib/chart-series";
import { exploreRanges } from "@/lib/explore-performance";
import { formatPct } from "@/lib/format";
import type { ListingDetail } from "@/lib/listing-detail";
import { useExplorePeriod } from "./explore-period-provider";
import { ReturnLinesChart } from "./return-lines-chart";
import styles from "./stock-detail.module.css";

function direction(value: number) {
  return value > 0 ? "text-up" : value < 0 ? "text-down" : "text-text-secondary";
}

function gapLabel(value: number) {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}`;
}

/**
 * The chart, verdict, and period table for a stock outside the tracked set,
 * laid out like the tracked stock page. Everything comes from the stock's own
 * closes and the S&P 500's, both up to the stock's latest close.
 */
export function ListingPerformance({ stock }: { stock: Pick<ListingDetail, "ticker" | "exchange" | "currency" | "benchmark" | "closesThrough" | "returns" | "series"> }) {
  const { range, setRange } = useExplorePeriod();
  const selected = stock.returns.find(row => row.period === range)!;
  const { gap } = selected;
  const axis = stock.series[range].benchmark;
  const status = gap === null ? "Comparison unavailable" : gap > 0 ? "Ahead of the market" : gap < 0 ? "Behind the market" : "In line with the market";
  const hasReturns = stock.returns.some(row => row.stock !== null);

  return <>
    <section className={`overview-panel ${styles.panel}`} aria-label={`${stock.ticker} performance`}>
      <div className="overview-main">
        <div className={`overview-top ${styles.chartTop}`}><h2>Performance against the market</h2><div className="range-control" role="group" aria-label="Performance range">{exploreRanges.map(period => <button key={period} type="button" aria-pressed={range === period} onClick={() => setRange(period)}>{period}</button>)}</div></div>
        <dl className="overview-metrics">
          <div><dt><span className="text-ink" aria-hidden="true">●</span> {stock.ticker} <span className={styles.metricRange}>{range}</span></dt><dd>{selected.stock === null ? "—" : formatPct(selected.stock)}</dd></div>
          <div><dt><span className="text-chart-benchmark" aria-hidden="true">●</span> {stock.benchmark} <span className={styles.metricRange}>{range}</span></dt><dd className="text-chart-benchmark">{selected.benchmark === null ? "—" : formatPct(selected.benchmark)}</dd></div>
          <div><dt>vs. the market</dt><dd className={gap === null ? undefined : direction(gap)}>{gap === null ? "—" : <>{gapLabel(gap)}<small> pp</small></>}</dd></div>
        </dl>
        <ReturnLinesChart axis={axis} line={alignTo(axis, stock.series[range].stock)} label={`${stock.ticker} and ${stock.benchmark} returns over ${range}. Exact values follow in the table.`} empty={hasReturns ? "Not enough price history for this period." : "The chart appears once this stock’s price history has loaded."} />
        <div className="chart-caption"><span>{stock.closesThrough ? `Daily closes to ${stock.closesThrough}` : "Daily closes"}</span><span>{stock.currency}</span></div>
      </div>
      <aside className={`overview-aside ${styles.aside}`}>
        <div><div className="aside-heading"><h2>The market comparison</h2><span className="period-tag">{range}</span></div>
          <p className={`${styles.verdict} ${gap === null ? "" : direction(gap)}`}>{status}</p>
          <p className={styles.explanation}>{selected.stock !== null && selected.benchmark !== null && gap !== null
            ? <>{stock.ticker} {selected.stock > 0 ? "gained" : selected.stock < 0 ? "lost" : "returned"} {Math.abs(selected.stock).toFixed(2)}% over {range}, {gap === 0 ? "matching" : `while the ${stock.benchmark} ${selected.benchmark < 0 ? "lost" : "gained"}`} {gap === 0 ? `the ${stock.benchmark}` : `${Math.abs(selected.benchmark).toFixed(2)}%`}.{gap !== 0 && <> That puts it {Math.abs(gap).toFixed(2)} percentage points {gap > 0 ? "ahead" : "behind"}.</>}</>
            : "There aren’t enough returns available to compare this period yet."}</p>
        </div>
        <div className={styles.facts}><h2>About this comparison</h2><dl>
          <div><dt>Exchange</dt><dd>{stock.exchange}</dd></div>
          <div><dt>Benchmark</dt><dd>{stock.benchmark}</dd></div>
          <div><dt>Currency</dt><dd>{stock.currency}</dd></div>
        </dl></div>
      </aside>
    </section>

    <section className={styles.periods} aria-labelledby="period-performance-heading">
      <div className="section-heading"><h2 id="period-performance-heading">A closer look</h2><span>Across every timeframe</span></div>
      <div className={styles.tableScroll}><table className={styles.table}>
        <caption className="sr-only">{stock.ticker} returns compared with the {stock.benchmark}; differences in percentage points.</caption>
        <thead><tr><th scope="col">Period</th><th scope="col">{stock.ticker}</th><th scope="col">{stock.benchmark}</th><th scope="col">Difference</th><th scope="col">Against the market</th></tr></thead>
        <tbody>{stock.returns.map(row => (
          <tr key={row.period} data-selected={range === row.period}><th scope="row"><button type="button" aria-pressed={range === row.period} aria-label={`Show ${row.period} comparison`} onClick={() => setRange(row.period)}>{row.period}</button></th>
            <td>{row.stock === null ? "—" : formatPct(row.stock)}</td>
            <td>{row.benchmark === null ? "—" : formatPct(row.benchmark)}</td>
            <td className={row.gap === null ? undefined : direction(row.gap)}>{row.gap === null ? "—" : `${gapLabel(row.gap)} pp`}</td>
            <td className={row.gap === null ? undefined : direction(row.gap)}>{row.gap === null ? "Unavailable" : row.gap > 0 ? "Ahead" : row.gap < 0 ? "Behind" : "In line"}</td>
          </tr>
        ))}</tbody>
      </table></div>
      {!hasReturns && <p className={styles.message}>Returns appear once this stock’s price history has loaded. Try again in a minute.</p>}
    </section>
  </>;
}
