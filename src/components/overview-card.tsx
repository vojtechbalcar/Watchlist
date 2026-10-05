"use client";

import { useState } from "react";
import { StockLogo } from "./stock-logo";
import { formatPct } from "@/lib/format";
import type { Holding } from "@/lib/watchlist-data";
import { watchlistRows } from "@/lib/watchlist-catalog";
import { watchlistSummary } from "@/lib/watchlist-state";
import { exploreRanges } from "@/lib/explore-performance";
import { benchmarkTicker } from "@/lib/explore-data";
import { alignTo, averageLines } from "@/lib/chart-series";
import { ReturnLinesChart } from "./return-lines-chart";
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
  const values = averageLines(rows.map(row => alignTo(axis, lines?.series[row.ticker]?.[range] ?? [])));

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
      <ReturnLinesChart axis={axis} line={values} label={`Watchlist average and ${summary.benchmarkLabel} returns over ${range}`} empty={lines ? "The chart appears once prices for this period are in." : "Loading chart…"} />
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
