"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useRemovalUndo } from "./removal-undo";
import { toggleWatchlistStock, useWatchlist, useWatchlistReady } from "./watchlist-store";
import styles from "./stock-detail.module.css";

/** Adds a stock page's stock to the watchlist, or removes it with an undo. */
export function WatchlistToggle({ ticker }: { ticker: string }) {
  const { tickers } = useWatchlist();
  const ready = useWatchlistReady();
  const undo = useRemovalUndo(tickers);
  const [saveError, setSaveError] = useState(false);
  const added = tickers.includes(ticker);

  function toggleStock() {
    setSaveError(!(added ? undo.remove(ticker) : toggleWatchlistStock(ticker)));
  }

  return <div>
    <div className={styles.actions}><button type="button" className={styles.membership} aria-pressed={added} disabled={!ready} onClick={toggleStock}>
      {added ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{added ? "In your watchlist" : "Add to watchlist"}
    </button>{undo.pending?.ticker === ticker && <button className={styles.undo} onClick={() => setSaveError(!undo.undo())}>Undo removal</button>}</div>
    {saveError && <p role="alert" className={styles.message}>Your browser couldn’t save that change. Allow site storage and try again.</p>}
  </div>;
}
