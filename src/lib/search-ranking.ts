/** Shared by the stock API routes and the browser. */

/** Every stock search and the sector lists can show, as the browser holds it. */
export type DirectoryStock = {
  symbol: string;
  name: string;
  exchange: string | null;
  sector: string | null;
  /** Kept current by the price job; the rest are priced on demand. */
  tracked: boolean;
};

/**
 * GET /api/stocks. Rows are [symbol, name, exchange index, sector index,
 * tracked], with -1 for no exchange or sector, to keep ~6,400 rows small.
 */
export type DirectoryPayload = {
  exchanges: string[];
  sectors: string[];
  stocks: [string, string, number, number, 0 | 1][];
};

export function decodeDirectory(payload: DirectoryPayload): DirectoryStock[] {
  return payload.stocks.map(([symbol, name, exchange, sector, tracked]) => ({
    symbol, name,
    exchange: payload.exchanges[exchange] ?? null,
    sector: payload.sectors[sector] ?? null,
    tracked: tracked === 1,
  }));
}

/** GET /api/stocks/quotes. Missing symbols have no price yet. */
export type StockQuote = {
  price: number | null;
  changePct: number | null;
  currency: string;
  /** A Twelve Data logo for untracked stocks; tracked ones use the local symbols. */
  logoUrl: string | null;
};

export const SEARCH_LIMIT = 6;
/** The most symbols one quotes request may ask for. */
export const QUOTE_LIMIT = 60;
export const MAX_QUERY_LENGTH = 40;
/** How long a price fetched for search is reused before search asks again. */
export const SEARCH_PRICE_TTL_MINUTES = 15;

export function normalizeQuery(query: string | null) {
  return (query ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

const NO_MATCH = 5;

/** Exact ticker, ticker prefix, name prefix, a later name word's prefix, then anywhere in the name. */
function matchRank(query: string, candidate: { symbol: string; name: string }) {
  const upper = query.toUpperCase();
  const lower = query.toLowerCase();
  const name = candidate.name.toLowerCase();
  if (candidate.symbol === upper) return 0;
  if (candidate.symbol.startsWith(upper)) return 1;
  if (name.startsWith(lower)) return 2;
  if (name.includes(` ${lower}`)) return 3;
  if (name.includes(lower)) return 4;
  return NO_MATCH;
}

export function rankCandidates<T extends { symbol: string; name: string; tracked: boolean }>(query: string, candidates: T[], limit = SEARCH_LIMIT) {
  return candidates
    .map(candidate => ({ candidate, rank: matchRank(query, candidate) }))
    .filter(({ rank }) => rank < NO_MATCH)
    .sort((a, b) => a.rank - b.rank || Number(b.candidate.tracked) - Number(a.candidate.tracked) || a.candidate.symbol.length - b.candidate.symbol.length || a.candidate.symbol.localeCompare(b.candidate.symbol))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function isPriceFresh(fetchedAt: Date | null, now: Date) {
  return fetchedAt !== null && now.getTime() - fetchedAt.getTime() < SEARCH_PRICE_TTL_MINUTES * 60 * 1000;
}

/** Upper-case tickers like BRK.B or BF-A, deduplicated and capped; anything else is dropped. */
export function parseSymbols(value: string | null) {
  const symbols = (value ?? "").split(",").map(symbol => symbol.trim().toUpperCase()).filter(symbol => /^[A-Z0-9.-]{1,12}$/.test(symbol));
  return [...new Set(symbols)].slice(0, QUOTE_LIMIT);
}
