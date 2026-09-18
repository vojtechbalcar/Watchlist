"use client";

import { useSyncExternalStore } from "react";
import { availableWatchlistTickers } from "@/lib/watchlist-catalog";
import { emptyWatchlist, parseWatchlist, validTickers, WATCHLIST_KEY, type WatchlistState } from "@/lib/watchlist-state";

const changeEvent = "watchlist-stocks-change";
let cachedRaw: string | null | undefined;
let cachedState = emptyWatchlist;

function getSnapshot() {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedState = parseWatchlist(raw, availableWatchlistTickers);
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

function writeState(update: (state: WatchlistState) => WatchlistState): boolean {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(update(getSnapshot())));
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

export function completeWatchlistSetup(tickers: string[]) {
  const chosen = validTickers(tickers, availableWatchlistTickers);
  if (!chosen.length) return false;
  return writeState(state => ({
    tickers: [...new Set([...state.tickers, ...chosen])],
    setupDismissed: false,
    setupCompleted: true,
  }));
}

export function dismissWatchlistSetup() {
  return writeState(state => ({ ...state, setupDismissed: true }));
}
