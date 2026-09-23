"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePreferences } from "./preferences-provider";
import { useRemovalUndo } from "./removal-undo";
import type { Preferences } from "@/lib/preferences";
import { StockLink } from "./stock-link";
import { formatPrice, formatPct } from "@/lib/format";
import type { Holding, WatchlistSummary } from "@/lib/watchlist-data";

type Sort = "ticker" | "price" | "changePct" | "vsBenchmarkPct";
export function WatchlistTable({ holdings, benchmarkLabel, compact = false, initialFilter }: {
  holdings: Holding[]; summary?: WatchlistSummary; benchmarkLabel: string; compact?: boolean; initialFilter?: Preferences["watchlistFilter"];
}) {
  const [query, setQuery] = useState("");
  const preferences = usePreferences();
  const [selectedFilter, setFilter] = useState<Preferences["watchlistFilter"] | null>(initialFilter ?? null);
  const filter = selectedFilter ?? preferences.watchlistFilter;
  const [removeFailed, setRemoveFailed] = useState(false);
  const [placeholder, setPlaceholder] = useState<{ holding: Holding; position: number } | null>(null);
  const undo = useRemovalUndo(useMemo(() => holdings.map(h => h.ticker), [holdings]));
  const removed = placeholder && undo.pending?.ticker === placeholder.holding.ticker ? placeholder : null;
  const undoButton = useRef<HTMLButtonElement>(null);
  const section = useRef<HTMLElement>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const [selectedSort, setSort] = useState<{ key: Sort; ascending: boolean } | null>(null);
  const sort = selectedSort?.key ?? (preferences.watchlistSort === "original" ? null : preferences.watchlistSort);
  const ascending = selectedSort?.ascending ?? (preferences.sortDirection === "ascending");
  const live = holdings;
  const ahead = live.filter(h => h.vsBenchmarkPct > 0).length;
  const rows = useMemo(() => {
    const result = holdings
      .filter(h => filter === "All stocks" || (filter === "Ahead" ? h.vsBenchmarkPct > 0 : h.vsBenchmarkPct <= 0))
      .filter(h => (h.ticker + " " + h.name).toLowerCase().includes(query.trim().toLowerCase()));
    if (sort) result.sort((a, b) => {
      const delta = sort === "ticker" ? a.ticker.localeCompare(b.ticker) : Number(a[sort]) - Number(b[sort]);
      return ascending ? delta : -delta;
    });
    return result;
  }, [holdings, filter, query, sort, ascending]);
  // Removing and undoing both destroy the control that had focus, so hand it to its replacement.
  useEffect(() => { undoButton.current?.focus(); }, [removed?.holding.ticker]);
  useEffect(() => { if (restored) section.current?.querySelector<HTMLButtonElement>(`[data-remove="${restored}"]`)?.focus(); }, [restored]);
  // The placeholder marks a position, so it stops meaning anything once the order changes.
  function dismissUndo() { undo.dismiss(); setPlaceholder(null); setRemoveFailed(false); }
  function changeSort(key: Sort) { dismissUndo(); setSort({ key, ascending: sort === key ? !ascending : true }); }
  function removeStock(holding: Holding, position: number) {
    setRestored(null);
    setRemoveFailed(!undo.remove(holding.ticker));
    setPlaceholder({ holding, position });
  }
  function undoRemoval() {
    const ticker = removed?.holding.ticker;
    setRemoveFailed(false);
    if (undo.undo()) { setPlaceholder(null); setRestored(ticker ?? null); }
  }
  const entries = rows.map(holding => ({ holding, isPlaceholder: false }));
  if (removed) entries.splice(Math.min(removed.position, entries.length), 0, { holding: removed.holding, isPlaceholder: true });
  return <section ref={section} aria-label="Your watchlist">
    {removeFailed && <p role="alert" className="mb-4 text-xs text-text-secondary">Your browser couldn’t save that change. Allow site storage and try again.</p>}
    {undo.undoFailed && <p role="alert" className="mb-4 text-xs text-text-secondary">Your browser couldn’t bring {undo.pending?.ticker} back. Allow site storage, then try Undo again.</p>}
    {compact ? <div className="section-heading"><h2>Your watchlist <small>{live.length} stocks</small></h2><Link href="/watchlist">Full watchlist ↗</Link></div> :
      <div className="page-heading"><div><p className="eyebrow">YOUR STOCKS, IN PERSPECTIVE</p><h1 className="page-title">Watchlist</h1><p className="mt-3 text-sm text-text-muted">{live.length} stocks · {ahead} ahead of {benchmarkLabel}</p></div><Link href="/explore" className="primary-action">＋ Add stocks</Link></div>}
    <div className="stock-toolbar">
      <div className="stock-tabs" role="tablist" aria-label="Filter stocks">
        {(["All stocks", "Ahead", "Behind"] as const).map((tab, i) => <button key={tab} role="tab" aria-selected={filter === tab} onClick={() => { dismissUndo(); setFilter(tab); }}>{tab}<span>{[live.length, ahead, live.length - ahead][i]}</span></button>)}
      </div>
      <label className="stock-search"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" /><path d="m13 13 5 5" stroke="currentColor" /></svg><input aria-label="Search stocks" type="search" placeholder="Search stocks" value={query} onChange={e => { dismissUndo(); setQuery(e.target.value); }} /></label>
    </div>
    <div className="stock-table-scroll">
      <table className="stock-table">
        <caption className="sr-only">Stocks compared with {benchmarkLabel}, year to date</caption>
        <thead><tr>{([["ticker", "Company"], ["price", "Last price"], ["changePct", "Day change"], ["vsBenchmarkPct", "vs. " + benchmarkLabel + "  YTD"]] as const).map(([key, label]) => <th key={key} scope="col" aria-sort={sort === key ? ascending ? "ascending" : "descending" : "none"}><button onClick={() => changeSort(key)}>{label} <span aria-hidden="true" className="ml-1 opacity-50">{sort === key ? ascending ? "↑" : "↓" : "⇅"}</span></button></th>)}{!compact && <th scope="col"><span className="sr-only">Actions</span></th>}</tr></thead>
        <tbody>{entries.map(({ holding: h, isPlaceholder }) => isPlaceholder
          ? <tr key={"removed-" + h.ticker} className="removed-row">
              <td colSpan={compact ? 4 : 5}><span className="removed-note"><span role="status">{h.ticker} removed from your watchlist</span><button ref={undoButton} onClick={undoRemoval}>Undo</button></span></td>
            </tr>
          : <tr key={h.ticker}>
          <th scope="row"><StockLink stock={h} /></th>
          <td>{formatPrice(h.price)}</td>
          <td className={h.changePct >= 0 ? "text-up" : "text-down"}>{formatPct(h.changePct)}<small>{h.changeAbs >= 0 ? "+" : "−"}{formatPrice(Math.abs(h.changeAbs))}</small></td>
          <td className={h.vsBenchmarkPct >= 0 ? "text-up" : "text-down"}><span className="benchmark-cell"><span>{h.vsBenchmarkPct >= 0 ? "+" : "−"}{Math.abs(h.vsBenchmarkPct).toFixed(2)} <small>pp</small></span><span className="gap-bar" aria-hidden="true"><i style={{width: Math.min(Math.abs(h.vsBenchmarkPct) / 2.5 * 50, 50) + "%", left: h.vsBenchmarkPct >= 0 ? "50%" : undefined, right: h.vsBenchmarkPct < 0 ? "50%" : undefined}} /></span></span></td>
          {!compact && <td className="pl-4"><button className="text-text-faint hover:text-ink p-2" data-remove={h.ticker} aria-label={"Remove " + h.ticker + " from watchlist"} onClick={() => removeStock(h, rows.indexOf(h))}>×</button></td>}
        </tr>)}
        {rows.length === 0 && !removed && <tr><td colSpan={compact ? 4 : 5} className="!text-center text-text-muted">{live.length === 0 ? "Your watchlist is empty. Explore stocks to get started." : "No stocks match your filters."}</td></tr>}
        </tbody>
      </table>
    </div>
    <div className="stock-table-footer"><span>{rows.length} of {live.length} stocks</span><span>Benchmark differences in percentage points</span></div>
  </section>;
}
