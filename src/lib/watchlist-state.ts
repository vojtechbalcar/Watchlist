import type { Holding } from "./watchlist-data";
import type { Sector } from "./explore-data";

export const WATCHLIST_KEY = "watchlist.stocks.v1";
export type SetupDraft = { version: 1; step: 0 | 1 | 2; interests: Sector[]; selected: string[] };
export const emptySetupDraft: SetupDraft = { version: 1, step: 0, interests: [], selected: [] };
export type WatchlistState = { tickers: string[]; setupDismissed: boolean; setupCompleted: boolean; setupDraft: SetupDraft | null };
export const emptyWatchlist: WatchlistState = { tickers: [], setupDismissed: false, setupCompleted: false, setupDraft: null };

export function validTickers(value: unknown, available: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((ticker): ticker is string => typeof ticker === "string" && available.includes(ticker)))];
}

function parseSetupDraft(value: unknown, available: readonly string[], availableSectors: readonly Sector[]): SetupDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  if (source.version !== 1) return null;
  const selected = validTickers(source.selected, available);
  const step = source.step === 1 || source.step === 2 ? source.step : 0;
  return {
    version: 1,
    step: step === 2 && !selected.length ? 1 : step,
    interests: validTickers(source.interests, availableSectors) as Sector[],
    selected,
  };
}

export function parseWatchlist(raw: string | null, available: readonly string[], availableSectors: readonly Sector[] = []): WatchlistState {
  if (!raw) return emptyWatchlist;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return emptyWatchlist;
    const source = value as Record<string, unknown>;
    return {
      tickers: validTickers(source.tickers, available),
      setupDismissed: source.setupDismissed === true,
      setupCompleted: source.setupCompleted === true,
      setupDraft: parseSetupDraft(source.setupDraft, available, availableSectors),
    };
  } catch {
    return emptyWatchlist;
  }
}

/** Removal reports the position it freed so an undo can restore the row where it was. */
export function withoutTicker(list: readonly string[], ticker: string): { list: string[]; index: number } {
  const index = list.indexOf(ticker);
  return { list: index < 0 ? [...list] : list.filter((_, position) => position !== index), index };
}

/** Restores into the list that exists now, which may have shrunk or already regained the stock. */
export function withTickerAt(list: readonly string[], ticker: string, index: number): string[] {
  if (list.includes(ticker)) return [...list];
  const next = [...list];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, ticker);
  return next;
}

/** Touching membership means setup is behind the user, as adding a stock already does. */
export function removeTickerState(state: WatchlistState, ticker: string): { state: WatchlistState; index: number } | null {
  const { list, index } = withoutTicker(state.tickers, ticker);
  if (index < 0) return null;
  return { state: { ...state, setupCompleted: true, tickers: list }, index };
}

export function restoreTickerState(state: WatchlistState, ticker: string, index: number, available: readonly string[]): WatchlistState | null {
  if (!available.includes(ticker)) return null;
  return { ...state, setupCompleted: true, tickers: withTickerAt(state.tickers, ticker, index) };
}

/** Completion and draft cleanup are one state transition, persisted in one write. */
export function completeSetupState(state: WatchlistState, tickers: string[], available: readonly string[]): WatchlistState | null {
  const selected = validTickers(tickers, available);
  if (!selected.length) return null;
  return {
    tickers: [...new Set([...state.tickers, ...selected])],
    setupDismissed: false,
    setupCompleted: true,
    setupDraft: null,
  };
}

export function watchlistSummary(rows: Holding[], benchmarkReturn: number) {
  const leadPct = rows.length ? rows.reduce((sum, row) => sum + row.vsBenchmarkPct, 0) / rows.length : 0;
  return {
    total: rows.length,
    beating: rows.filter(row => row.vsBenchmarkPct > 0).length,
    behind: rows.filter(row => row.vsBenchmarkPct < 0).length,
    leadPct,
    watchlistPct: rows.length ? benchmarkReturn + leadPct : 0,
  };
}
