import { normalizeQuery, rankCandidates, type DirectoryStock } from "./search-ranking";

/**
 * Untracked stocks setup offers after the featured (tracked) ones. With no
 * search and no sectors chosen it offers none rather than 6,400 rows; a
 * search reaches the whole directory, and chosen sectors narrow both.
 */
export function setupCandidates(directory: DirectoryStock[], { interests, query, shown }: { interests: string[]; query: string; shown: number }) {
  const search = normalizeQuery(query);
  const pool = directory.filter(stock => !stock.tracked && (!interests.length || (stock.sector !== null && interests.includes(stock.sector))));
  if (!search && !interests.length) return { stocks: [], total: 0 };
  const matches = search ? rankCandidates(search, pool, pool.length) : pool;
  return { stocks: matches.slice(0, shown), total: matches.length };
}
