"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { usePreferences, usePreferencesReady } from "./preferences-provider";
import { CompareBodySkeleton } from "./skeletons";
import { useWatchlist } from "./watchlist-store";
import { StockLink } from "./stock-link";
import { CompareChart } from "./compare-chart";
import { formatPct } from "@/lib/format";
import { exploreUniverse } from "@/lib/explore-data";
import { compareBenchmark, compareColors, compareRanges, compareRows, type CompareRange } from "@/lib/compare-data";
import { addComparisonStock, comparisonLimit, initialComparison, reconcileComparison } from "@/lib/compare-selection";
import styles from "./compare-view.module.css";

function Gap({ value }: { value: number }) {
  return <span className={value > 0 ? "text-up" : value < 0 ? "text-down" : "text-text-secondary"}>
    {value > 0 ? "+" : value < 0 ? "−" : ""}{Math.abs(value).toFixed(2)} <small>pp</small>
  </span>;
}

export function CompareView() {
  const watchlist = useWatchlist();
  const ready = usePreferencesReady();
  return <>
    <div className="page-heading">
      <div><p className="eyebrow">A clearer view, side by side</p><h1 className="page-title">Compare</h1></div>
      <div className="page-actions"><Link href="/watchlist">Your watchlist &nbsp; ↗</Link><Link href="/explore" className="primary-action">Explore stocks ↗</Link></div>
    </div>
    {!ready ? <CompareBodySkeleton /> :
      watchlist.tickers.length === 0 ? <section className={styles.empty} aria-label="No saved stocks">
        <h2>Start with a few stocks.</h2>
        <p>Save companies to your watchlist, then compare their returns with each other and the S&P 500.</p>
        <div className={styles.actions}><Link href="/watchlist" className="primary-action">Set up your watchlist ↗</Link><Link href="/explore">Browse stocks ↗</Link></div>
      </section> : <SavedComparison tickers={watchlist.tickers} />}
  </>;
}

function SavedComparison({ tickers }: { tickers: string[] }) {
  const preferences = usePreferences();
  const [selectedRange, setRange] = useState<CompareRange | null>(null);
  const range = selectedRange ?? preferences.compareRange;
  const [selection, setSelection] = useState(() => initialComparison(tickers));
  const picker = useRef<HTMLSelectElement>(null);
  const active = reconcileComparison(selection, tickers);
  // Discard stocks removed in another tab so adding them back doesn't restore a stale choice.
  if (active.length !== selection.length) setSelection(active);

  const selected = active.map(item => item.ticker);
  const slots = Object.fromEntries(active.map(item => [item.ticker, item.colorSlot]));
  const rows = compareRows(range, selected, slots);
  const ranked = [...rows].sort((a, b) => b.returnPct - a.returnPct);
  const available = exploreUniverse.filter(stock => tickers.includes(stock.ticker) && !selected.includes(stock.ticker));
  const unavailable = selected.filter(ticker => !rows.some(row => row.series.ticker === ticker));
  const beating = rows.filter(row => row.vsBenchmarkPct > 0).length;
  const behind = rows.filter(row => row.vsBenchmarkPct < 0).length;
  const neutral = rows.length - beating - behind;
  const full = active.length >= comparisonLimit;

  function removeStock(ticker: string) {
    setSelection(active.filter(item => item.ticker !== ticker));
    requestAnimationFrame(() => picker.current?.focus());
  }

  const rangeControl = <div className="range-control" role="group" aria-label="Comparison range">
    {compareRanges.map(value => <button key={value} aria-pressed={range === value} onClick={() => setRange(value)}>{value}</button>)}
  </div>;

  return <>
    <div className="comparison-selection">
      <div className="selection-stocks">
        <span className="control-label">Stocks</span>
        {active.map(item => <span key={item.ticker} className={`selection-chip ${styles.chip}`}>
          <i style={{ background: compareColors[item.colorSlot] }} aria-hidden="true" />{item.ticker}
          <button aria-label={`Remove ${item.ticker} from comparison`} onClick={() => removeStock(item.ticker)}>×</button>
        </span>)}
        <label className={`selection-add ${styles.picker}`}>
          <span className="sr-only">Add a saved stock to compare</span>
          <select ref={picker} value="" disabled={full || available.length === 0} aria-describedby="comparison-hint"
            onChange={event => {
              const ticker = event.target.value;
              setSelection(previous => addComparisonStock(previous, ticker, tickers));
            }}>
            <option value="" disabled>{full ? "3 stocks selected" : available.length ? "＋ Add saved stock" : "All saved stocks selected"}</option>
            {available.map(stock => <option key={stock.ticker} value={stock.ticker}>{stock.ticker} · {stock.name}</option>)}
          </select>
        </label>
      </div>
      <div className="selection-benchmark"><span className="control-label">Benchmark</span><span><i aria-hidden="true">┄</i> {compareBenchmark.label}</span></div>
    </div>
    <p id="comparison-hint" className={styles.hint}>{full ? "Compare up to 3 saved stocks at a time. Remove one to choose another." : "Choose up to 3 stocks from your watchlist. Removing a comparison keeps the stock saved."}</p>
    <p className="sr-only" role="status">{selected.length ? `Comparing ${selected.join(", ")} over ${range}.` : "No stocks selected for comparison."}</p>

    {rows.length === 0 ? <section className={styles.emptyPanel} aria-label="Performance comparison">
      <div className="overview-top"><h2>Relative performance</h2>{rangeControl}</div>
      <div className={styles.noSelection}><h3>{selected.length ? "Returns unavailable for this period." : "Choose a stock above."}</h3>
        <p>{selected.length ? `There are no ${range} returns for ${selected.join(", ")}. Try another period or choose a different stock.` : "Your watchlist is ready. Add a stock to see how it compares with the S&P 500."}</p>
      </div>
    </section> : <>
      <section className="overview-panel compare-panel" aria-label="Performance comparison">
        <div className="overview-main">
          <div className="overview-top"><h2>Relative performance</h2>{rangeControl}</div>
          {unavailable.length > 0 && <p className={styles.notice} role="status">{range} returns are unavailable for {unavailable.join(", ")}. Try another period to include {unavailable.length === 1 ? "this stock" : "these stocks"}.</p>}
          <dl className="comparison-metrics">{rows.map(row => <div key={row.series.ticker}>
            <dt><i style={{ background: row.series.colorVar }} aria-hidden="true" />{row.series.ticker}</dt>
            <dd>{formatPct(row.returnPct)}</dd><small><Gap value={row.vsBenchmarkPct} /> vs. market</small>
          </div>)}</dl>
          <CompareChart rows={rows} benchmarkLabel={compareBenchmark.label} range={range} />
          <div className="chart-caption"><span><span className="text-chart-benchmark">┄</span> {compareBenchmark.label} <span className="ml-2">{formatPct(compareBenchmark.returnByRange[range])}</span></span><span>Illustrative returns · {range}</span></div>
        </div>
        <aside className="overview-aside compare-aside">
          <div>
            <div className="aside-heading"><h3>Beating the benchmark</h3><span className="period-tag">{range}</span></div>
            <div className="beating-count"><strong>{beating}</strong><span>/ {rows.length}</span><small>stocks ahead</small></div>
            <div className="beating-bars" aria-hidden="true">{rows.map(row => <i key={row.series.ticker} style={{ background: row.vsBenchmarkPct > 0 ? "var(--color-up)" : row.vsBenchmarkPct < 0 ? "var(--color-down)" : "var(--color-text-faint)" }} />)}</div>
            <div className={`beating-key ${styles.key}`}><span>• {beating} ahead</span><span>• {behind} behind</span>{neutral > 0 && <span>• {neutral} in line</span>}</div>
          </div>
          <div className="comparison-ranking">
            <div className="aside-heading"><h3>Performance ranking</h3><span className="period-tag">{range}</span></div>
            {ranked.map((row, i) => <div className="ranking-row" key={row.series.ticker}>
              <span className="rank-number">{String(i + 1).padStart(2, "0")}</span><StockLink stock={row.holding} /><span>{formatPct(row.returnPct)}</span>
            </div>)}
          </div>
        </aside>
      </section>
      <section className="comparison-detail">
        <div className="section-heading"><h2>Side by side <small>{rows.length} stocks</small></h2><span className="text-sm text-text-muted">{range}</span></div>
        <div className="stock-table-scroll"><table className="comparison-table">
          <caption className="sr-only">Returns and differences between selected stocks, in percentage points</caption>
          <thead><tr><th scope="col">Company</th><th scope="col">Return</th><th scope="col">vs. {compareBenchmark.label}</th>{rows.map(row => <th scope="col" key={row.series.ticker}>vs. {row.series.ticker}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.series.ticker}>
            <th scope="row"><StockLink stock={row.holding} /></th>
            <td>{formatPct(row.returnPct)}</td><td><Gap value={row.vsBenchmarkPct} /></td>
            {rows.map(peer => <td key={peer.series.ticker}>{row.vsPeers[peer.series.ticker] === null ? <span className="text-text-faint" aria-label="Same stock">—</span> : <Gap value={row.vsPeers[peer.series.ticker]!} />}</td>)}
          </tr>)}</tbody>
        </table></div>
        <div className="stock-table-footer"><span>Compared with {compareBenchmark.label}</span><span>Differences in percentage points</span></div>
      </section>
    </>}
  </>;
}
