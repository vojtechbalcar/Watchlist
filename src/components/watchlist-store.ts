"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isWatchlistTicker } from "@/lib/watchlist-catalog";
import { sectors } from "@/lib/explore-data";
import { completeSetupState, emptySetupDraft, emptyWatchlist, parseWatchlist, removeTickerState, restoreTickerState, WATCHLIST_KEY, type SetupDraft, type WatchlistState } from "@/lib/watchlist-state";
import { writeWatchlistStorage } from "@/lib/watchlist-storage";
import { reconcileWatchlist } from "@/lib/watchlist-sync";
import { usePreferencesReady } from "./preferences-provider";
import { createAccountSync } from "./account-sync";

const changeEvent = "watchlist-stocks-change";
let cachedRaw: string | null | undefined;
let cachedState = emptyWatchlist;

function getSnapshot() {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedState = parseWatchlist(raw, isWatchlistTicker, sectors);
    }
  } catch { /* Browsing remains available when storage is blocked. */ }
  return cachedState;
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === WATCHLIST_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, callback);
  };
}

export function useWatchlist() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptyWatchlist);
}

function writeState(update: (state: WatchlistState) => WatchlistState | null): boolean {
  try {
    if (!writeWatchlistStorage(localStorage, update)) return false;
    window.dispatchEvent(new Event(changeEvent));
    sync.changed();
    return true;
  } catch { return false; }
}

/** See createAccountSync and src/lib/watchlist-sync.ts for how the copies meet. */
const sync = createAccountSync<WatchlistState>({
  endpoint: "/api/watchlist",
  ownerKey: "watchlist.owner.v1",
  read: getSnapshot,
  replace(state) {
    try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(state)); } catch { /* Blocked storage. */ }
    window.dispatchEvent(new Event(changeEvent));
  },
  reconcile: reconcileWatchlist,
  empty: emptyWatchlist,
});

/** Mounted once in the (market) layout for the signed-in account. */
export function WatchlistSync({ userId }: { userId: string }) {
  useEffect(() => { void sync.start(userId); }, [userId]);
  return null;
}

/**
 * True once the account's list has loaded (or failed to), so pages don't show
 * an empty watchlist, or another account's, while it's on its way.
 */
export function useWatchlistReady() {
  const preferencesReady = usePreferencesReady();
  return useSyncExternalStore(sync.subscribe, sync.isSynced, () => false) && preferencesReady;
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
