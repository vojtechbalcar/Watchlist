"use client";

import Link from "next/link";
import { useState } from "react";
import { ListPlus } from "lucide-react";
import { usePreferencesReady } from "./preferences-provider";
import { restartWatchlistSetup, useWatchlist } from "./watchlist-store";
import { emptySetupDraft, type SetupDraft, type WatchlistState } from "@/lib/watchlist-state";
import { watchlistRows } from "@/lib/watchlist-catalog";
import { WatchlistSetup } from "./watchlist-setup";
import { WatchlistTable } from "./watchlist-table";
import { OverviewCard } from "./overview-card";
import { OverviewCardSkeleton, PageHeadingSkeleton, WatchlistTableSkeleton } from "./skeletons";
import styles from "./watchlist-setup.module.css";

export function WatchlistWorkspace({ dashboard = false }: { dashboard?: boolean }) {
  const state = useWatchlist();
  const ready = usePreferencesReady();
  if (!ready) return dashboard
    ? <><PageHeadingSkeleton /><OverviewCardSkeleton /><div className="mt-10"><WatchlistTableSkeleton compact /></div></>
    : <WatchlistTableSkeleton />;
  return <ReadyWorkspace state={state} dashboard={dashboard} />;
}

function ReadyWorkspace({ state, dashboard }: { state: WatchlistState; dashboard: boolean }) {
  const [editing, setEditing] = useState(!state.tickers.length && !state.setupDraft && !state.setupDismissed && !state.setupCompleted);
  const [initialDraft, setInitialDraft] = useState<SetupDraft | null>(null);
  const [focusSetup, setFocusSetup] = useState(false);
  const [restartError, setRestartError] = useState(false);
  const [created, setCreated] = useState(false);
  const rows = watchlistRows(state.tickers);

  // A successful completion in another tab closes an older editor too.
  if (editing && rows.length && !state.setupDraft) setEditing(false);

  function startOver() {
    if (!restartWatchlistSetup()) { setRestartError(true); return; }
    setRestartError(false);
    setInitialDraft(emptySetupDraft);
    setFocusSetup(true);
    setCreated(false);
    setEditing(true);
  }

  if (editing) return <WatchlistSetup initialDraft={initialDraft} focusOnMount={focusSetup}
    onComplete={() => { setCreated(true); setEditing(false); }} onSkip={() => setEditing(false)} />;

  const ResumeHeading = rows.length ? "h2" : "h1";
  const resume = state.setupDraft && <section className={styles.resume} aria-label="Saved setup progress">
    <p className="eyebrow">Right where you left off</p>
    <ResumeHeading className={rows.length ? undefined : "page-title"}>Continue building your watchlist</ResumeHeading>
    <p>Your choices are saved in this browser. Pick up at step {state.setupDraft.step + 1} of 3, or start fresh.</p>
    <p className={styles.resumeSummary}>{state.setupDraft.interests.length ? `${state.setupDraft.interests.length} ${state.setupDraft.interests.length === 1 ? "sector" : "sectors"}` : "All sectors"} · {state.setupDraft.selected.length} {state.setupDraft.selected.length === 1 ? "stock" : "stocks"} selected</p>
    {state.setupDraft.selected.length > 0 && <p className={styles.resumeStocks}>{state.setupDraft.selected.slice(0, 5).join(" · ")}{state.setupDraft.selected.length > 5 && ` · +${state.setupDraft.selected.length - 5} more`}</p>}
    <div className={styles.resumeActions}>
      <button className="primary-action" onClick={() => { setInitialDraft(state.setupDraft); setFocusSetup(true); setRestartError(false); setEditing(true); }}>Continue setup</button>
      <button className={styles.restart} onClick={startOver}>Start over</button>
      <Link href="/explore">Explore stocks ↗</Link>
    </div>
    {restartError && <p className={styles.error} role="alert">Your browser couldn’t restart setup. Your saved progress is still here. Try Start over again.</p>}
  </section>;

  if (!rows.length && resume) return resume;
  if (!rows.length) {
    return <section className={styles.empty}>
      <ListPlus size={32} strokeWidth={1.3} aria-hidden="true" />
      <p className="eyebrow">A fresh perspective</p><h1 className="page-title">Your watchlist starts here</h1>
      <p>Choose a few companies to see which are beating the market. We’ll help you get started.</p>
      <div><button className="primary-action" onClick={startOver}>Set up my watchlist</button><Link href="/explore">Explore stocks on my own ↗</Link></div>
      {restartError && <p className={styles.error} role="alert">Your browser couldn’t save setup progress. Allow site storage, then try again.</p>}
    </section>;
  }
  return <>
    {resume}
    {created && <p className={styles.success} role="status">Your watchlist is ready. Add or remove stocks whenever you like.</p>}
    {dashboard && <>
      <div className="page-heading"><div><p className="eyebrow">Your market at a glance</p><h1 className="page-title">Overview</h1></div><div className="page-actions"><Link href="/compare">Compare stocks &nbsp; ↗</Link><Link href="/explore" className="primary-action">＋ Add stocks</Link></div></div>
      <OverviewCard holdings={rows} />
    </>}
    <div className={dashboard ? "mt-10" : undefined}><WatchlistTable holdings={rows} benchmarkLabel="S&P 500" compact={dashboard} initialFilter={created ? "All stocks" : undefined} /></div>
  </>;
}
