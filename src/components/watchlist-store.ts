"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isWatchlistTicker } from "@/lib/watchlist-catalog";
import { sectors } from "@/lib/explore-data";
import { completeSetupState, emptySetupDraft, emptyWatchlist, parseWatchlist, removeTickerState, restoreTickerState, WATCHLIST_KEY, type SetupDraft, type WatchlistState } from "@/lib/watchlist-state";
import { writeWatchlistStorage } from "@/lib/watchlist-storage";
import { reconcileWatchlist } from "@/lib/watchlist-sync";
import { usePreferencesReady } from "./preferences-provider";

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
    afterLocalWrite();
    return true;
  } catch { return false; }
}

/*
 * Account sync. localStorage stays the working copy, so every change is
 * instant and other tabs see it; the account's copy (/api/watchlist) is what
 * other devices load. src/lib/watchlist-sync.ts decides how the two meet.
 */

/** The account this browser's copy was last synced for. */
const OWNER_KEY = "watchlist.owner.v1";
const syncEvent = "watchlist-sync-change";
/** After this, show the browser's copy rather than wait on a slow network. */
const LOAD_TIMEOUT_MS = 8000;
const PUSH_DELAY_MS = 400;

let syncUser: string | null = null;
let synced = false;
let editedBeforeLoad = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

function afterLocalWrite() {
  if (!syncUser) return;
  if (!synced) { editedBeforeLoad = true; return; }
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void push(getSnapshot()), PUSH_DELAY_MS);
}

async function push(state: WatchlistState) {
  try {
    // keepalive lets a change made just before leaving the page still arrive.
    await fetch("/api/watchlist", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }), keepalive: true });
  } catch { /* The next change sends the whole list again. */ }
}

function readOwner() {
  try { return localStorage.getItem(OWNER_KEY); } catch { return null; }
}

function finishSync(userId: string, local: WatchlistState) {
  try {
    if (JSON.stringify(local) !== JSON.stringify(getSnapshot())) localStorage.setItem(WATCHLIST_KEY, JSON.stringify(local));
    localStorage.setItem(OWNER_KEY, userId);
  } catch { /* Blocked storage: the page keeps working from memory. */ }
  synced = true;
  window.dispatchEvent(new Event(changeEvent));
  window.dispatchEvent(new Event(syncEvent));
}

async function startSync(userId: string) {
  if (syncUser === userId) return;
  syncUser = userId;
  synced = false;
  editedBeforeLoad = false;
  let server: WatchlistState | null = null;
  try {
    const response = await fetch("/api/watchlist", { cache: "no-store", signal: AbortSignal.timeout(LOAD_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Watchlist answered ${response.status}`);
    server = ((await response.json()) as { state: WatchlistState | null }).state;
  } catch {
    // Offline or slow: use this browser's copy if it is this account's, and try saving again on the next change.
    const owner = readOwner();
    finishSync(userId, owner === null || owner === userId ? getSnapshot() : emptyWatchlist);
    return;
  }
  const { local, upload } = reconcileWatchlist({ server, local: getSnapshot(), localOwner: readOwner(), userId, editedBeforeLoad });
  finishSync(userId, local);
  if (upload) await push(upload);
}

/** Mounted once in the (market) layout for the signed-in account. */
export function WatchlistSync({ userId }: { userId: string }) {
  useEffect(() => { void startSync(userId); }, [userId]);
  return null;
}

function subscribeSync(callback: () => void) {
  window.addEventListener(syncEvent, callback);
  return () => window.removeEventListener(syncEvent, callback);
}

/**
 * True once the account's list has loaded (or failed to), so pages don't show
 * an empty watchlist, or another account's, while it's on its way.
 */
export function useWatchlistReady() {
  const preferencesReady = usePreferencesReady();
  return useSyncExternalStore(subscribeSync, () => synced, () => false) && preferencesReady;
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
