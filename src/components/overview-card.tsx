"use client";

import { useState } from "react";
import { StockLogo } from "./stock-logo";
import { formatPct } from "@/lib/format";
import type { Holding } from "@/lib/watchlist-data";
import { watchlistRows } from "@/lib/watchlist-catalog";
import { watchlistSummary } from "@/lib/watchlist-state";
import { exploreRanges } from "@/lib/explore-performance";
import { benchmarkTicker } from "@/lib/explore-data";
import { alignTo, averageLines, axisLabels } from "@/lib/chart-series";
import { useMarket, useMarketSeries } from "./market-provider";

const periods = exploreRanges;

export function OverviewCard({ holdings }: { holdings: Holding[] }) {
  const market = useMarket();
  const lines = useMarketSeries();
  const [range, setRange] = useState<typeof periods[number]>("YTD");
  const benchTotal = market.benchmark.returnByRange[range];
  const rows = watchlistRows(market.stocks, holdings.map(stock => stock.ticker), range, market.benchmark.returnByRange);
  const summary = { ...watchlistSummary(rows, benchTotal), benchmarkLabel: market.benchmark.label };
  const total = summary.watchlistPct;
  const lead = total !== null && benchTotal !== null ? total - benchTotal : null;

  // The benchmark's dates are the axis; the watchlist line is the equal-weight average of its stocks' lines.
  const axis = lines?.series[benchmarkTicker(market.benchmark.label)]?.[range] ?? [];
  const benchValues = axis.map(([, value]) => value);
  const values = averageLines(rows.map(row => alignTo(axis, lines?.series[row.ticker]?.[range] ?? [])));
  const plotted = [...values, ...benchValues].filter((value): value is number => value !== null);
  const max = Math.ceil(Math.max(0, ...plotted) / 4) * 4 || 4;
  const min = Math.floor(Math.min(0, ...plotted) / 4) * 4;
  const y = (value: number) => 200 - (value - min) / (max - min) * 180;
  const x = (index: number) => 8 + (axis.length > 1 ? index / (axis.length - 1) : 1) * 902;
  const points = (data: (number | null)[]) => data.flatMap((value, i) => value === null ? [] : [`${x(i)},${y(value)}`]).join(" ");
  const lastValue = values.findLast(value => value !== null) ?? null;

  const moving = holdings.filter((stock): stock is Holding & { changePct: number } => stock.changePct !== null);
  const gain = [...moving].sort((a, b) => b.changePct - a.changePct)[0];
  const decline = [...moving].sort((a, b) => a.changePct - b.changePct)[0];
  return <section className="overview-panel" aria-label="Watchlist performance">
    <div className="overview-main">
      <div className="overview-top"><h2>Watchlist performance</h2><div className="range-control" role="group" aria-label="Performance range">{periods.map(p => <button key={p} aria-pressed={range === p} onClick={() => setRange(p)}>{p}</button>)}</div></div>
      <dl className="overview-metrics">
        <div><dt><span className="text-ink">●</span> Stock average</dt><dd>{total === null ? "—" : formatPct(total)}</dd></div>
        <div><dt><span className="text-chart-benchmark">●</span> {summary.benchmarkLabel}</dt><dd className="text-chart-benchmark">{benchTotal === null ? "—" : formatPct(benchTotal)}</dd></div>
        <div><dt>vs. the market</dt><dd className={lead === null ? undefined : lead >= 0 ? "text-up" : "text-down"}>{lead === null ? "—" : <>{lead >= 0 ? "+" : "−"}{Math.abs(lead).toFixed(2)}<small> pp</small></>}</dd></div>
      </dl>
      <figure>
        <svg viewBox="0 0 980 235" className="block w-full h-[240px] sm:h-[260px]" preserveAspectRatio="none" role="img" aria-label={`Watchlist average and ${summary.benchmarkLabel} returns over ${range}`}>
          {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="8" x2="910" y1={200 - i * 45} y2={200 - i * 45} stroke="var(--color-line-soft)" strokeDasharray="4 6" /><text x="976" y={204 - i * 45} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">{min + (max - min) / 4 * i}%</text></g>)}
          {axis.length > 1 && <>
            {lastValue !== null && <polygon points={`${x(0)},${y(0)} ${points(values)} ${x(values.findLastIndex(value => value !== null))},${y(0)}`} fill={lastValue >= 0 ? "var(--color-up-surface)" : "var(--color-down-surface)"} />}
            <polyline points={points(benchValues)} fill="none" stroke="var(--color-chart-benchmark)" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
            <polyline points={points(values)} fill="none" stroke="var(--color-chart-watchlist)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            {lastValue !== null && <circle cx="910" cy={y(lastValue)} r="3.5" fill="var(--color-ink)" stroke="var(--color-surface)" strokeWidth="2" />}
            <circle cx="910" cy={y(benchValues.at(-1)!)} r="3" fill="var(--color-chart-benchmark)" stroke="var(--color-surface)" strokeWidth="2" />
            {axisLabels(axis).map(({ index, label }, i, all) => <text key={index} x={x(index)} y="230" textAnchor={i === 0 ? "start" : i === all.length - 1 ? "end" : "middle"} fill="var(--color-text-muted)" fontSize="10">{label}</text>)}
          </>}
          {axis.length <= 1 && <text x="459" y="110" textAnchor="middle" fill="var(--color-text-muted)" fontSize="12">{lines ? "The chart appears once prices for this period are in." : "Loading chart…"}</text>}
        </svg>
      </figure>
      <div className="chart-caption"><span className={lead === null ? "text-text-secondary" : lead > 0 ? "text-up" : lead < 0 ? "text-down" : "text-text-secondary"}>{lead === null ? "Comparison unavailable" : lead > 0 ? "Ahead of" : lead < 0 ? "Behind" : "In line with"} {lead !== null && summary.benchmarkLabel}</span><span>Equal-weight average · Daily closes</span></div>
    </div>
    <aside className="overview-aside">
      <div><div className="aside-heading"><h3>Beating the market</h3><span className="period-tag">{range}</span></div>
        <div className="beating-count"><strong>{summary.beating}</strong><span>/ {summary.total}</span><small>stocks ahead</small></div>
        <div className="beating-bars" aria-hidden="true">{Array.from({length: summary.total}, (_, i) => <i key={i} className={i < summary.beating ? "ahead" : ""} />)}</div>
        <div className="beating-key"><span>• {summary.beating} ahead</span><span>• {summary.behind} behind</span></div>
      </div>
      <div className="movers"><div className="aside-heading"><h3>Today’s movers</h3><span className="period-tag">1D</span></div>
        {!gain && <p className="mt-4 text-xs text-text-muted">No moves yet today.</p>}
        {gain && (gain.ticker === decline.ticker ? [gain] : [gain, decline]).map((stock, i) => <div key={stock.ticker} className="mover"><p><span>{moving.length === 1 ? "Today’s move" : i === 0 ? "Strongest today" : "Weakest today"}</span><span>{stock.changePct >= 0 ? "↗" : "↘"}</span></p><div className="mover-row"><StockLogo stock={stock} /><span>{stock.ticker}<small>{stock.name}</small></span><strong className={stock.changePct > 0 ? "text-up" : "text-down"}>{formatPct(stock.changePct)}</strong></div></div>)}
      </div>
    </aside>
  </section>;
}
