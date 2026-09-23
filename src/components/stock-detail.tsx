"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Plus } from "lucide-react";
import { benchmarkFor, sectorSlug, type ExploreStock } from "@/lib/explore-data";
import { explorePerformance, exploreRanges } from "@/lib/explore-performance";
import { formatPct, formatPrice } from "@/lib/format";
import { StockLogo } from "./stock-logo";
import { StockReturnChart } from "./stock-return-chart";
import { useExplorePeriod } from "./explore-period-provider";
import { usePreferencesReady } from "./preferences-provider";
import { toggleWatchlistStock, useWatchlist } from "./watchlist-store";
import { useRemovalUndo } from "./removal-undo";
import styles from "./stock-detail.module.css";

function direction(value: number) {
  return value > 0 ? "text-up" : value < 0 ? "text-down" : "text-text-secondary";
}

function gapLabel(value: number) {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}`;
}

export function StockDetail({ stock }: { stock: ExploreStock }) {
  const { range, setRange } = useExplorePeriod();
  const { tickers } = useWatchlist();
  const ready = usePreferencesReady();
  const undo = useRemovalUndo(tickers);
  const [saveError, setSaveError] = useState(false);
  const added = tickers.includes(stock.ticker);
  const benchmark = benchmarkFor(stock);
  const performance = explorePerformance(stock, range);
  const gap = performance?.gap;
  const status = gap === undefined ? "Comparison unavailable" : gap > 0 ? "Ahead of the market" : gap < 0 ? "Behind the market" : "In line with the market";

  function toggleStock() {
    setSaveError(!(added ? undo.remove(stock.ticker) : toggleWatchlistStock(stock.ticker)));
  }

  return <>
    <nav aria-label="Stock navigation" className={styles.breadcrumb}>
      <Link href="/explore"><ArrowLeft size={14} aria-hidden="true" /> Explore</Link><span aria-hidden="true">/</span><Link href={`/explore/${sectorSlug(stock.sector)}`}>{stock.sector}</Link><span aria-hidden="true">/</span><span>{stock.ticker}</span>
    </nav>
    <header className={styles.heading}>
      <div className={styles.identity}><StockLogo stock={stock} /><div><p className="eyebrow">{stock.sector} · {stock.ticker}</p><h1>{stock.name}</h1></div></div>
      <div className={styles.actions}><button type="button" className={styles.membership} aria-pressed={added} disabled={!ready} onClick={toggleStock}>
        {added ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{added ? "In your watchlist" : "Add to watchlist"}
      </button>{undo.pending?.ticker === stock.ticker && <button className={styles.undo} onClick={() => setSaveError(!undo.undo())}>Undo removal</button>}</div>
    </header>
    {saveError && <p role="alert" className={styles.message}>Your browser couldn’t save that change. Allow site storage and try again.</p>}
    <div className={styles.quote}><strong>${formatPrice(stock.price)}</strong><span className={direction(stock.changePct)}>{formatPct(stock.changePct)}</span><span>today · {stock.currency}</span></div>

    <section className={`overview-panel ${styles.panel}`} aria-label={`${stock.ticker} performance`}>
      <div className="overview-main">
        <div className={`overview-top ${styles.chartTop}`}><h2>Performance against the market</h2><div className="range-control" role="group" aria-label="Performance range">{exploreRanges.map(period => <button key={period} type="button" aria-pressed={range === period} onClick={() => setRange(period)}>{period}</button>)}</div></div>
        <dl className="overview-metrics">
          <div><dt><span className="text-ink" aria-hidden="true">●</span> {stock.ticker} <span className={styles.metricRange}>{range}</span></dt><dd data-return="stock">{performance ? formatPct(performance.stockReturn) : "—"}</dd></div>
          <div><dt><span className="text-chart-benchmark" aria-hidden="true">●</span> {benchmark} <span className={styles.metricRange}>{range}</span></dt><dd className="text-chart-benchmark" data-return="benchmark">{performance ? formatPct(performance.benchmarkReturn) : "—"}</dd></div>
          <div><dt>vs. the market</dt><dd className={gap === undefined ? undefined : direction(gap)} data-return="gap">{gap === undefined ? "—" : <>{gapLabel(gap)}<small> pp</small></>}</dd></div>
        </dl>
        <StockReturnChart stock={stock} range={range} />
      </div>
      <aside className={`overview-aside ${styles.aside}`}>
        <div><div className="aside-heading"><h2>The market comparison</h2><span className="period-tag">{range}</span></div>
          <p className={`${styles.verdict} ${gap === undefined ? "" : direction(gap)}`}>{status}</p>
          <p className={styles.explanation}>{performance ? <>{stock.ticker} {performance.stockReturn > 0 ? "gained" : performance.stockReturn < 0 ? "lost" : "returned"} {Math.abs(performance.stockReturn).toFixed(2)}% over {range}, {performance.gap === 0 ? "matching" : `while ${benchmark} ${performance.benchmarkReturn < 0 ? "lost" : "gained"}`} {performance.gap === 0 ? benchmark : `${Math.abs(performance.benchmarkReturn).toFixed(2)}%`}.{performance.gap !== 0 && <> That puts it {Math.abs(performance.gap).toFixed(2)} percentage points {performance.gap > 0 ? "ahead" : "behind"}.</>}</> : "There aren’t enough returns available to compare this period yet."}</p>
        </div>
        <div className={styles.facts}><h2>About this comparison</h2><dl>
          <div><dt>Sector</dt><dd>{stock.sector}</dd></div>
          <div><dt>Benchmark</dt><dd>{benchmark}</dd></div>
          <div><dt>Currency</dt><dd>{stock.currency}</dd></div>
        </dl><Link href={`/explore/${sectorSlug(stock.sector)}`}>Explore {stock.sector.toLowerCase()} <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
      </aside>
    </section>

    <section className={styles.periods} aria-labelledby="period-performance-heading">
      <div className="section-heading"><h2 id="period-performance-heading">A closer look</h2><span>Across every timeframe</span></div>
      <div className={styles.tableScroll}><table className={styles.table}>
        <caption className="sr-only">{stock.ticker} returns compared with {benchmark}; differences in percentage points.</caption>
        <thead><tr><th scope="col">Period</th><th scope="col">{stock.ticker}</th><th scope="col">{benchmark}</th><th scope="col">Difference</th><th scope="col">Against the market</th></tr></thead>
        <tbody>{exploreRanges.map(period => {
          const value = explorePerformance(stock, period);
          return <tr key={period} data-selected={range === period}><th scope="row"><button type="button" aria-pressed={range === period} aria-label={`Show ${period} comparison`} onClick={() => setRange(period)}>{period}</button></th>
            <td>{value ? formatPct(value.stockReturn) : "—"}</td><td>{value ? formatPct(value.benchmarkReturn) : "—"}</td>
            <td className={value ? direction(value.gap) : undefined}>{value ? `${gapLabel(value.gap)} pp` : "—"}</td>
            <td className={value ? direction(value.gap) : undefined}>{value ? value.gap > 0 ? "Ahead" : value.gap < 0 ? "Behind" : "In line" : "Unavailable"}</td>
          </tr>;
        })}</tbody>
      </table></div>
    </section>
  </>;
}
