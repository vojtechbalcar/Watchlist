"use client";

import { useState } from "react";
import { removeWatchlistStock, restoreWatchlistStock } from "./watchlist-store";

export type PendingRemoval = { ticker: string; index: number };

/**
 * One removal is reversible at a time. A second removal replaces the first, and a
 * pending undo whose stock returned some other way stops offering a stale restore.
 */
export function useRemovalUndo(savedTickers: readonly string[]) {
  const [pending, setPending] = useState<PendingRemoval | null>(null);
  const [undoFailed, setUndoFailed] = useState(false);
  const active = pending && !savedTickers.includes(pending.ticker) ? pending : null;

  function remove(ticker: string) {
    const { saved, index } = removeWatchlistStock(ticker);
    setUndoFailed(false);
    setPending(saved ? { ticker, index } : null);
    return saved;
  }

  function undo() {
    if (!active) return true;
    if (!restoreWatchlistStock(active.ticker, active.index)) { setUndoFailed(true); return false; }
    setPending(null);
    setUndoFailed(false);
    return true;
  }

  function dismiss() {
    setPending(null);
    setUndoFailed(false);
  }

  return { pending: active, undoFailed, remove, undo, dismiss };
}
