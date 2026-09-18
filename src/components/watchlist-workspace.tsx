"use client";

import Link from "next/link";
import { useState } from "react";
import { ListPlus } from "lucide-react";
import { usePreferencesReady } from "./preferences-provider";
import { useWatchlist } from "./watchlist-store";
import { watchlistRows } from "@/lib/watchlist-catalog";
import { WatchlistSetup } from "./watchlist-setup";
import { WatchlistTable } from "./watchlist-table";
import { OverviewCard } from "./overview-card";
import styles from "./watchlist-setup.module.css";

export function WatchlistWorkspace({ dashboard = false }: { dashboard?: boolean }) {
  const state = useWatchlist();
  const ready = usePreferencesReady();
  const [restart, setRestart] = useState(false);
  const [created, setCreated] = useState(false);
  const rows = watchlistRows(state.tickers);

  if (!ready) return <div className={styles.loading} role="status">Loading your watchlist…</div>;
  if (!rows.length) {
    if (restart || (!state.setupDismissed && !state.setupCompleted)) {
      return <WatchlistSetup onComplete={() => { setCreated(true); setRestart(false); }} onSkip={() => setRestart(false)} />;
    }
    return <section className={styles.empty}>
      <ListPlus size={32} strokeWidth={1.3} aria-hidden="true" />
      <p className="eyebrow">A fresh perspective</p><h1 className="page-title">Your watchlist starts here</h1>
      <p>Choose a few companies to see which are beating the market. We’ll help you get started.</p>
      <div><button className="primary-action" onClick={() => setRestart(true)}>Set up my watchlist</button><Link href="/explore">Explore stocks on my own ↗</Link></div>
    </section>;
  }
  return <>
    {created && <p className={styles.success} role="status">Your watchlist is ready. Add or remove stocks whenever you like.</p>}
    {dashboard && <>
      <div className="page-heading"><div><p className="eyebrow">Your market at a glance</p><h1 className="page-title">Overview</h1></div><div className="page-actions"><Link href="/compare">Compare stocks &nbsp; ↗</Link><Link href="/explore" className="primary-action">＋ Add stocks</Link></div></div>
      <OverviewCard holdings={rows} />
    </>}
    <div className={dashboard ? "mt-10" : undefined}><WatchlistTable holdings={rows} benchmarkLabel="S&P 500" compact={dashboard} initialFilter={created ? "All stocks" : undefined} /></div>
  </>;
}
