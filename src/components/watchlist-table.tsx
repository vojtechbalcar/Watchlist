"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePreferences } from "./preferences-provider";
import type { Preferences } from "@/lib/preferences";
import { StockLogo } from "./stock-logo";
import { formatPrice, formatPct } from "@/lib/format";
import type { Holding, WatchlistSummary } from "@/lib/watchlist-data";

type Sort = "ticker" | "price" | "changePct" | "vsBenchmarkPct";
export function WatchlistTable({ holdings, benchmarkLabel, compact = false }: {
  holdings: Holding[]; summary?: WatchlistSummary; benchmarkLabel: string; compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const preferences = usePreferences();
  const [selectedFilter, setFilter] = useState<Preferences["watchlistFilter"] | null>(null);
  const filter = selectedFilter ?? preferences.watchlistFilter;
  const [removed, setRemoved] = useState<string[]>([]);
  const [selectedSort, setSort] = useState<{ key: Sort; ascending: boolean } | null>(null);
  const sort = selectedSort?.key ?? (preferences.watchlistSort === "original" ? null : preferences.watchlistSort);
  const ascending = selectedSort?.ascending ?? (preferences.sortDirection === "ascending");
  const live = holdings.filter(h => !removed.includes(h.ticker));
  const ahead = live.filter(h => h.vsBenchmarkPct > 0).length;
  const rows = useMemo(() => {
    const result = holdings.filter(h => !removed.includes(h.ticker))
      .filter(h => filter === "All stocks" || (filter === "Ahead" ? h.vsBenchmarkPct > 0 : h.vsBenchmarkPct <= 0))
      .filter(h => (h.ticker + " " + h.name).toLowerCase().includes(query.trim().toLowerCase()));
    if (sort) result.sort((a, b) => {
      const delta = sort === "ticker" ? a.ticker.localeCompare(b.ticker) : Number(a[sort]) - Number(b[sort]);
      return ascending ? delta : -delta;
    });
    return result;
  }, [holdings, removed, filter, query, sort, ascending]);
  function changeSort(key: Sort) { setSort({ key, ascending: sort === key ? !ascending : true }); }
  return <section aria-label="Your watchlist">
    {compact ? <div className="section-heading"><h2>Your watchlist <small>{live.length} stocks</small></h2><Link href="/watchlist">Full watchlist ↗</Link></div> :
      <div className="page-heading"><div><p className="eyebrow">YOUR STOCKS, IN PERSPECTIVE</p><h1 className="page-title">Watchlist</h1><p className="mt-3 text-sm text-text-muted">{live.length} stocks · {ahead} ahead of {benchmarkLabel}</p></div><Link href="/explore" className="primary-action">＋ Add stocks</Link></div>}
    <div className="stock-toolbar">
      <div className="stock-tabs" role="tablist" aria-label="Filter stocks">
        {(["All stocks", "Ahead", "Behind"] as const).map((tab, i) => <button key={tab} role="tab" aria-selected={filter === tab} onClick={() => setFilter(tab)}>{tab}<span>{[live.length, ahead, live.length - ahead][i]}</span></button>)}
      </div>
      <label className="stock-search"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" /><path d="m13 13 5 5" stroke="currentColor" /></svg><input aria-label="Search stocks" type="search" placeholder="Search stocks" value={query} onChange={e => setQuery(e.target.value)} /></label>
    </div>
    <div className="stock-table-scroll">
      <table className="stock-table">
        <caption className="sr-only">Stocks compared with {benchmarkLabel}, year to date</caption>
        <thead><tr>{([["ticker", "Company"], ["price", "Last price"], ["changePct", "Day change"], ["vsBenchmarkPct", "vs. " + benchmarkLabel + "  YTD"]] as const).map(([key, label]) => <th key={key} scope="col" aria-sort={sort === key ? ascending ? "ascending" : "descending" : "none"}><button onClick={() => changeSort(key)}>{label} <span aria-hidden="true" className="ml-1 opacity-50">{sort === key ? ascending ? "↑" : "↓" : "⇅"}</span></button></th>)}{!compact && <th scope="col"><span className="sr-only">Actions</span></th>}</tr></thead>
        <tbody>{rows.map(h => <tr key={h.ticker}>
          <th scope="row"><span className="stock-company"><StockLogo stock={h} /><span><strong>{h.ticker}</strong><small>{h.name}</small></span></span></th>
          <td>{formatPrice(h.price)}</td>
          <td className={h.changePct >= 0 ? "text-up" : "text-down"}>{formatPct(h.changePct)}<small>{h.changeAbs >= 0 ? "+" : "−"}{formatPrice(Math.abs(h.changeAbs))}</small></td>
          <td className={h.vsBenchmarkPct >= 0 ? "text-up" : "text-down"}><span className="benchmark-cell"><span>{h.vsBenchmarkPct >= 0 ? "+" : "−"}{Math.abs(h.vsBenchmarkPct).toFixed(2)} <small>pp</small></span><span className="gap-bar" aria-hidden="true"><i style={{width: Math.min(Math.abs(h.vsBenchmarkPct) / 2.5 * 50, 50) + "%", left: h.vsBenchmarkPct >= 0 ? "50%" : undefined, right: h.vsBenchmarkPct < 0 ? "50%" : undefined}} /></span></span></td>
          {!compact && <td className="pl-4"><button className="text-text-faint hover:text-down p-2" aria-label={"Remove " + h.ticker + " from watchlist"} onClick={() => setRemoved(prev => [...prev, h.ticker])}>×</button></td>}
        </tr>)}
        {rows.length === 0 && <tr><td colSpan={compact ? 4 : 5} className="!text-center text-text-muted">{live.length === 0 ? "Your watchlist is empty. Explore stocks to get started." : "No stocks match your filters."}</td></tr>}
        </tbody>
      </table>
    </div>
    <div className="stock-table-footer"><span>{rows.length} of {live.length} stocks</span><span>Benchmark differences in percentage points</span></div>
  </section>;
}
