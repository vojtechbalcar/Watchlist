"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isWatchlistTicker } from "@/lib/watchlist-catalog";
import { sectors } from "@/lib/explore-data";
import { completeSetupState, emptySetupDraft, emptyWatchlist, parseWatchlist, removeTickerState, restoreTickerState, WATCHLIST_KEY, type SetupDraft, type WatchlistState } from "@/lib/watchlist-state";
import { reconcileWatchlist } from "@/lib/watchlist-sync";
import { createAccountCopy } from "@/lib/account-copy";
import { usePreferencesReady } from "./preferences-provider";

const copy = createAccountCopy<WatchlistState>({
  key: WATCHLIST_KEY,
  endpoint: "/api/watchlist",
  ownerKey: "watchlist.owner.v1",
  parse: raw => parseWatchlist(raw, isWatchlistTicker, sectors),
  reconcile: reconcileWatchlist,
  empty: emptyWatchlist,
});

export function useWatchlist() {
  return useSyncExternalStore(copy.subscribe, copy.getSnapshot, copy.getServerSnapshot);
}

const writeState = copy.update;

/** Mounted once in the (market) layout for the signed-in account. */
export function WatchlistSync({ userId }: { userId: string }) {
  useEffect(() => { void copy.start(userId); }, [userId]);
  return null;
}

/**
 * True once the account's list has loaded (or failed to), so pages don't show
 * an empty watchlist, or another account's, while it's on its way.
 */
export function useWatchlistReady() {
  const preferencesReady = usePreferencesReady();
  return useSyncExternalStore(copy.subscribe, copy.isSynced, () => false) && preferencesReady;
}

export function toggleWatchlistStock(ticker: string) {
  if (!isWatchlistTicker(ticker)) return false;
  return writeState(state => ({
    ...state,
    setupCompleted: true,
    tickers: state.tickers.includes(ticker) ? state.tickers.filter(item => item !== ticker) : [...state.tickers, ticker],
  }));
}

/** Reports the freed position so an undo restores the stock where the user had it. */
export function removeWatchlistStock(ticker: string): { saved: boolean; index: number } {
  let freed = -1;
  const saved = writeState(state => {
    const result = removeTickerState(state, ticker);
    if (!result) return null;
    freed = result.index;
    return result.state;
  });
  return { saved, index: saved ? freed : -1 };
}

export function restoreWatchlistStock(ticker: string, index: number) {
  return writeState(state => restoreTickerState(state, ticker, index, isWatchlistTicker));
}

export function completeWatchlistSetup(tickers: string[]) {
  return writeState(state => completeSetupState(state, tickers, isWatchlistTicker));
}

export function saveSetupDraft(draft: SetupDraft) {
  return writeState(state => ({ ...state, setupDraft: draft, setupDismissed: false }));
}

export function restartWatchlistSetup() {
  return saveSetupDraft(emptySetupDraft);
}

export function dismissWatchlistSetup(draft?: SetupDraft) {
  return writeState(state => ({ ...state, setupDismissed: true, setupDraft: draft ?? state.setupDraft }));
}
