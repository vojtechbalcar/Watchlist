/** Shared by /api/search and the Explore search dropdown. */
export type SearchResult = {
  ticker: string;
  name: string;
  exchange: string | null;
  /** Kept current by the price job and has a detail page. */
  tracked: boolean;
  /** A Twelve Data logo for untracked stocks; tracked ones use the local symbols. */
  logoUrl: string | null;
  price: number | null;
  changePct: number | null;
  currency: string;
};

export const SEARCH_LIMIT = 6;
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
