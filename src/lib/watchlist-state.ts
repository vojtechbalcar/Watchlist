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
