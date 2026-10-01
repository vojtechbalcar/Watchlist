import type { PrismaClient } from "@prisma/client";
import { reserveCredits } from "@/lib/api-budget";
import { isPriceFresh, normalizeQuery, rankCandidates, type SearchResult } from "@/lib/search-ranking";
import { fetchLogo, fetchQuotes, isTwelveDataConfigured } from "@/lib/twelve-data";

/** Candidates fetched before ranking; enough that good matches aren't cut off by the database's order. */
const CANDIDATES = 60;

/**
 * Finds stocks by ticker or name. Tracked stocks carry the price job's quote.
 * Others get a live price, reused for 15 minutes, and a logo the first time
 * they're found, as far as the search credit budget allows. Prices come
 * before logos; whatever doesn't fit shows without.
 */
export async function searchStocks(db: PrismaClient, rawQuery: string | null, now = new Date()): Promise<SearchResult[]> {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];
  const matches = { startsWith: query.toUpperCase() };
  const nameMatches = { contains: query, mode: "insensitive" as const };

  // The tracked set is a few dozen rows, so it is read whole, in parallel with the listing match.
  const [listings, instruments] = await Promise.all([
    db.listing.findMany({ where: { OR: [{ symbol: matches }, { name: nameMatches }] }, take: CANDIDATES }),
    db.instrument.findMany({ where: { kind: "STOCK" }, include: { quote: true } }),
  ]);
  const tracked = new Map(instruments.map(instrument => [instrument.ticker, instrument]));
  const listed = new Map(listings.map(listing => [listing.symbol, listing]));

  const candidates = [
    ...listings.map(listing => ({ symbol: listing.symbol, name: tracked.get(listing.symbol)?.name ?? listing.name, tracked: tracked.has(listing.symbol) })),
    // Tracked stocks are findable even before the first symbol sync.
    ...instruments.filter(instrument => !listed.has(instrument.ticker)).map(instrument => ({ symbol: instrument.ticker, name: instrument.name, tracked: true })),
  ];
  const top = rankCandidates(query, candidates);
  const untracked = top.filter(candidate => !candidate.tracked).map(candidate => listed.get(candidate.symbol)!);

  if (isTwelveDataConfigured() && untracked.length) {
    const stale = untracked.filter(listing => !isPriceFresh(listing.priceFetchedAt, now)).map(listing => listing.symbol);
    try {
      const symbols = stale.slice(0, await reserveCredits(db, "search", stale.length, now));
      await Promise.all((await fetchQuotes(symbols)).map(quote => {
        const data = { price: quote.price, changeAbs: quote.changeAbs, changePct: quote.changePct, priceFetchedAt: now };
        Object.assign(listed.get(quote.symbol)!, data);
        return db.listing.update({ where: { symbol: quote.symbol }, data });
      }));
    } catch (error) {
      console.error("[search] quotes", error);
    }

    const unchecked = untracked.filter(listing => !listing.logoCheckedAt).map(listing => listing.symbol);
    const logoSymbols = unchecked.slice(0, await reserveCredits(db, "search", unchecked.length, now));
    await Promise.all(logoSymbols.map(async symbol => {
      try {
        const data = { logoUrl: await fetchLogo(symbol), logoCheckedAt: now };
        await db.listing.update({ where: { symbol }, data });
        Object.assign(listed.get(symbol)!, data);
      } catch (error) {
        console.error("[search] logo", symbol, error);
      }
    }));
  }

  return top.map(candidate => {
    const instrument = tracked.get(candidate.symbol);
    const listing = listed.get(candidate.symbol);
    const quote = instrument ? instrument.quote : listing?.price != null ? listing : null;
    return {
      ticker: candidate.symbol,
      name: candidate.name,
      exchange: listing?.exchange ?? null,
      tracked: candidate.tracked,
      logoUrl: instrument ? null : listing?.logoUrl ?? null,
      price: quote?.price != null ? Number(quote.price) : null,
      changePct: quote?.changePct != null ? Number(quote.changePct) : null,
      currency: instrument?.currency ?? listing?.currency ?? "USD",
    };
  });
}
