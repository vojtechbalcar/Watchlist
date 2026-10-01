import type { PrismaClient } from "@prisma/client";
import { refreshListingLogos, refreshListingPrices } from "@/lib/listing-refresh";
import { normalizeQuery, rankCandidates, type SearchResult } from "@/lib/search-ranking";

/** Candidates fetched before ranking; enough that good matches aren't cut off by the database's order. */
const CANDIDATES = 60;

/**
 * Finds stocks by ticker or name. Tracked stocks carry the price job's quote.
 * Others get a live price, reused for 15 minutes, and a logo the first time
 * they're found, as far as the search credit budget allows.
 */
export async function searchStocks(db: PrismaClient, rawQuery: string | null, now = new Date()): Promise<SearchResult[]> {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];
  const matches = { startsWith: query.toUpperCase() };
  const nameMatches = { contains: query, mode: "insensitive" as const };

  // The tracked set is a few dozen rows, so it is read whole, in parallel with the listing match.
  const [listings, instruments] = await Promise.all([
    db.listing.findMany({ where: { OR: [{ symbol: matches }, { name: nameMatches }] }, omit: { closes: true }, take: CANDIDATES }),
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

  // Prices before logos, so a short budget goes where it matters.
  await refreshListingPrices(db, untracked, now);
  await refreshListingLogos(db, untracked, now);

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
