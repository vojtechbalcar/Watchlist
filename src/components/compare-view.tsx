"use client";

import Link from "next/link";
import { useState } from "react";
import { StockLogo } from "./stock-logo";
import { CompareChart } from "./compare-chart";
import { formatPct } from "@/lib/format";
import { compareBenchmark, compareRanges, compareRows, compareSeries, type CompareRange } from "@/lib/compare-data";

function Gap({ value }: { value: number }) {
  return <span className={value >= 0 ? "text-up" : "text-down"}>{value >= 0 ? "+" : "−"}{Math.abs(value).toFixed(2)} <small>pp</small></span>;
}

export function CompareView({ initialRange }: { initialRange: CompareRange }) {
  const [range, setRange] = useState(initialRange);
  const [selected, setSelected] = useState(compareSeries.map(s => s.ticker));
  const rows = compareRows(range, selected);
  const ranked = [...rows].sort((a, b) => b.returnPct - a.returnPct);
  const available = compareSeries.filter(s => !selected.includes(s.ticker));
  const beating = rows.filter(r => r.vsBenchmarkPct > 0).length;
  return <>
    <div className="page-heading"><div><p className="eyebrow">A clearer view, side by side</p><h1 className="page-title">Compare</h1></div><div className="page-actions"><Link href="/watchlist">Your watchlist &nbsp; ↗</Link><Link href="/explore" className="primary-action">Explore stocks ↗</Link></div></div>
    <div className="comparison-selection">
      <div className="selection-stocks"><span className="control-label">Stocks</span>{rows.map(row => <span key={row.series.ticker} className="selection-chip"><i style={{background: row.series.colorVar}} />{row.series.ticker}<button disabled={selected.length === 1} title={selected.length === 1 ? "Keep at least one stock to compare" : "Remove stock"} aria-label={"Remove " + row.series.ticker + " from comparison"} onClick={() => setSelected(prev => prev.filter(t => t !== row.series.ticker))}>×</button></span>)}
        {available.length > 0 && <label className="selection-add"><span className="sr-only">Add a stock to compare</span><select value="" onChange={e => setSelected(prev => [...prev, e.target.value])}><option value="" disabled>＋ Add stock</option>{available.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}</select></label>}
      </div>
      <div className="selection-benchmark"><span className="control-label">Benchmark</span><span><i aria-hidden="true">┄</i> {compareBenchmark.label}</span></div>
    </div>
    <section className="overview-panel compare-panel" aria-label="Performance comparison">
      <div className="overview-main">
        <div className="overview-top"><h2>Relative performance</h2><div className="range-control" role="group" aria-label="Comparison range">{compareRanges.map(r => <button key={r} aria-pressed={range === r} onClick={() => setRange(r)}>{r}</button>)}</div></div>
        <dl className="comparison-metrics">{rows.map(row => <div key={row.series.ticker}><dt><i style={{background: row.series.colorVar}} />{row.series.ticker}</dt><dd>{formatPct(row.returnPct)}</dd><small><Gap value={row.vsBenchmarkPct} /> vs. market</small></div>)}</dl>
        <CompareChart rows={rows} benchmarkLabel={compareBenchmark.label} range={range} />
        <div className="chart-caption"><span><span className="text-chart-benchmark">┄</span> {compareBenchmark.label} <span className="ml-2">{formatPct(compareBenchmark.returnByRange[range])}</span></span><span>Returns over {range}</span></div>
      </div>
      <aside className="overview-aside compare-aside"><div><div className="aside-heading"><h3>Beating the benchmark</h3><span className="period-tag">{range}</span></div><div className="beating-count"><strong>{beating}</strong><span>/ {rows.length}</span><small>stocks ahead</small></div><div className="beating-bars" aria-hidden="true">{rows.map((r, i) => <i key={r.series.ticker} className={i < beating ? "ahead" : ""} />)}</div><div className="beating-key"><span>• {beating} ahead</span><span>• {rows.length - beating} behind</span></div></div>
        <div className="comparison-ranking"><div className="aside-heading"><h3>Performance ranking</h3><span className="period-tag">{range}</span></div>{ranked.map((row, i) => <div className="ranking-row" key={row.series.ticker}><span className="rank-number">{String(i + 1).padStart(2, "0")}</span><StockLogo stock={row.holding} /><div><strong>{row.series.ticker}</strong><small>{row.holding.name}</small></div><span>{formatPct(row.returnPct)}</span></div>)}</div>
      </aside>
    </section>
    <section className="comparison-detail"><div className="section-heading"><h2>Side by side <small>{rows.length} stocks</small></h2><span className="text-sm text-text-muted">{range}</span></div>
      <div className="stock-table-scroll"><table className="comparison-table"><caption className="sr-only">Returns and differences between selected stocks, in percentage points</caption><thead><tr><th scope="col">Company</th><th scope="col">Return</th><th scope="col">vs. {compareBenchmark.label}</th>{rows.map(r => <th scope="col" key={r.series.ticker}>vs. {r.series.ticker}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.series.ticker}><th scope="row"><span className="stock-company"><StockLogo stock={row.holding} /><span><strong>{row.series.ticker}</strong><small>{row.holding.name}</small></span></span></th><td>{formatPct(row.returnPct)}</td><td><Gap value={row.vsBenchmarkPct} /></td>{rows.map(peer => <td key={peer.series.ticker}>{row.vsPeers[peer.series.ticker] === null ? <span className="text-text-faint" aria-label="Same stock">—</span> : <Gap value={row.vsPeers[peer.series.ticker]!} />}</td>)}</tr>)}</tbody></table></div>
      <div className="stock-table-footer"><span>Compared with {compareBenchmark.label}</span><span>Differences in percentage points</span></div>
    </section>
  </>;
}
