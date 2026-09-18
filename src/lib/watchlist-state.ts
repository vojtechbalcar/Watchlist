import type { Holding } from "./watchlist-data";

export const WATCHLIST_KEY = "watchlist.stocks.v1";
export type WatchlistState = { tickers: string[]; setupDismissed: boolean; setupCompleted: boolean };
export const emptyWatchlist: WatchlistState = { tickers: [], setupDismissed: false, setupCompleted: false };

export function validTickers(value: unknown, available: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((ticker): ticker is string => typeof ticker === "string" && available.includes(ticker)))];
}

export function parseWatchlist(raw: string | null, available: readonly string[]): WatchlistState {
  if (!raw) return emptyWatchlist;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return emptyWatchlist;
    const source = value as Record<string, unknown>;
    return {
      tickers: validTickers(source.tickers, available),
      setupDismissed: source.setupDismissed === true,
      setupCompleted: source.setupCompleted === true,
    };
  } catch {
    return emptyWatchlist;
  }
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
