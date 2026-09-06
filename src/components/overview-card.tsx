"use client";

import { useState } from "react";
import { StockLogo } from "./stock-logo";
import { formatPct } from "@/lib/format";
import { holdings, type OverviewSummary } from "@/lib/watchlist-data";

const paths = [0, 3.4, 2.9, 4.2, 5.3, 4.1, 2.5, 5.6, 7.1, 8.2, 7.8, 10.5, 12, 11.4, 13.4, 15.2];
const periods = ["1M", "3M", "6M", "YTD"] as const;
const starts = { "1M": 12, "3M": 9, "6M": 4, YTD: 0 };
export function OverviewCard({ summary }: { summary: OverviewSummary }) {
  const [range, setRange] = useState<typeof periods[number]>("YTD");
  const start = starts[range];
  const values = paths.slice(start).map(v => ((1 + v / 100) / (1 + paths[start] / 100) - 1) * 100);
  const benchmark = paths.map((v, i) => v - i / (paths.length - 1) * summary.leadPct);
  const benchValues = benchmark.slice(start).map(v => ((1 + v / 100) / (1 + benchmark[start] / 100) - 1) * 100);
  const max = Math.ceil(Math.max(...values, ...benchValues) / 4) * 4 || 4;
  const points = (data: number[]) => data.map((v, i) => `${8 + i / (data.length - 1) * 902},${200 - v / max * 180}`).join(" ");
  const total = range === "YTD" ? summary.watchlistPct : values.at(-1)!;
  const benchTotal = benchValues.at(-1)!;
  const gain = [...holdings].sort((a, b) => b.changePct - a.changePct)[0];
  const decline = [...holdings].sort((a, b) => a.changePct - b.changePct)[0];
  return <section className="overview-panel" aria-label="Watchlist performance">
    <div className="overview-main">
      <div className="overview-top"><h2>Watchlist performance</h2><div className="range-control" role="group" aria-label="Performance range">{periods.map(p => <button key={p} aria-pressed={range === p} onClick={() => setRange(p)}>{p}</button>)}</div></div>
      <dl className="overview-metrics">
        <div><dt><span className="text-ink">●</span> Your watchlist</dt><dd>{formatPct(total)}</dd></div>
        <div><dt><span className="text-chart-benchmark">●</span> {summary.benchmarkLabel}</dt><dd className="text-chart-benchmark">{formatPct(benchTotal)}</dd></div>
        <div><dt>vs. the market</dt><dd className={total >= benchTotal ? "text-up" : "text-down"}>{total >= benchTotal ? "+" : "−"}{Math.abs(total - benchTotal).toFixed(2)}<small> pp</small></dd></div>
      </dl>
      <figure>
        <svg viewBox="0 0 980 235" className="block w-full h-[240px] sm:h-[260px]" preserveAspectRatio="none" role="img" aria-label={"Demo watchlist and S&P 500 performance over " + range}>
          {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="8" x2="910" y1={200 - i * 45} y2={200 - i * 45} stroke="var(--color-line-soft)" strokeDasharray="4 6" /><text x="976" y={204 - i * 45} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">{max / 4 * i}%</text></g>)}
          <polygon points={"8,200 " + points(values) + " 910,200"} fill="var(--color-chart-lead)" />
          <polyline points={points(benchValues)} fill="none" stroke="var(--color-chart-benchmark)" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
          <polyline points={points(values)} fill="none" stroke="var(--color-chart-watchlist)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <circle cx="910" cy={200 - total / max * 180} r="3.5" fill="var(--color-ink)" stroke="var(--color-surface)" strokeWidth="2" />
          <circle cx="910" cy={200 - benchTotal / max * 180} r="3" fill="var(--color-chart-benchmark)" stroke="var(--color-surface)" strokeWidth="2" />
          <text x="8" y="230" fill="var(--color-text-muted)" fontSize="10">{range === "YTD" ? "Jan 1" : range === "6M" ? "Feb 25" : range === "3M" ? "May 25" : "Jul 25"}</text>
          <text x="310" y="230" fill="var(--color-text-muted)" fontSize="10">{range === "YTD" ? "Mar 15" : ""}</text>
          <text x="607" y="230" fill="var(--color-text-muted)" fontSize="10">{range === "YTD" ? "Jun 15" : ""}</text>
          <text x="910" y="230" textAnchor="end" fill="var(--color-text-muted)" fontSize="10">Aug 25</text>
        </svg>
      </figure>
      <div className="chart-caption"><span className="text-up">↗ &nbsp; Ahead of {summary.benchmarkLabel} this period</span><span>{range === "YTD" ? "Jan 1" : range === "6M" ? "Feb 25" : range === "3M" ? "May 25" : "Jul 25"} – Aug 25</span></div>
    </div>
    <aside className="overview-aside">
      <div><div className="aside-heading"><h3>Beating the market</h3><span className="period-tag">YTD</span></div>
        <div className="beating-count"><strong>{summary.beating}</strong><span>/ {summary.total}</span><small>stocks ahead</small></div>
        <div className="beating-bars" aria-hidden="true">{Array.from({length: summary.total}, (_, i) => <i key={i} className={i < summary.beating ? "ahead" : ""} />)}</div>
        <div className="beating-key"><span>• {summary.beating} ahead</span><span>• {summary.total - summary.beating} behind</span></div>
      </div>
      <div className="movers"><div className="aside-heading"><h3>Today’s movers</h3><span className="period-tag">1D</span></div>
        {[gain, decline].map((stock, i) => <div key={stock.ticker} className="mover"><p><span>{i === 0 ? "Top gainer" : "Biggest decline"}</span><span>{i === 0 ? "↗" : "↘"}</span></p><div className="mover-row"><StockLogo stock={stock} /><span>{stock.ticker}<small>{stock.name}</small></span><strong className={stock.changePct > 0 ? "text-up" : "text-down"}>{formatPct(stock.changePct)}</strong></div></div>)}
      </div>
    </aside>
  </section>;
}
