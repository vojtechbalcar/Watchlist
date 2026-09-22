"use client";

import { useSyncExternalStore } from "react";
import { availableWatchlistTickers } from "@/lib/watchlist-catalog";
import { sectors } from "@/lib/explore-data";
import { completeSetupState, emptySetupDraft, emptyWatchlist, parseWatchlist, removeTickerState, restoreTickerState, WATCHLIST_KEY, type SetupDraft, type WatchlistState } from "@/lib/watchlist-state";
import { writeWatchlistStorage } from "@/lib/watchlist-storage";

const changeEvent = "watchlist-stocks-change";
let cachedRaw: string | null | undefined;
let cachedState = emptyWatchlist;

function getSnapshot() {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedState = parseWatchlist(raw, availableWatchlistTickers, sectors);
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
    return true;
  } catch { return false; }
}

export function toggleWatchlistStock(ticker: string) {
  if (!availableWatchlistTickers.includes(ticker)) return false;
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
  return writeState(state => restoreTickerState(state, ticker, index, availableWatchlistTickers));
}

export function completeWatchlistSetup(tickers: string[]) {
  return writeState(state => completeSetupState(state, tickers, availableWatchlistTickers));
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
