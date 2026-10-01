import type { Listing, PrismaClient } from "@prisma/client";
import { reserveCredits } from "@/lib/api-budget";
import { latestSettledSession } from "@/lib/price-schedule";
import { isPriceFresh } from "@/lib/search-ranking";
import { fetchDailyCloses, fetchLogo, fetchQuotes, isTwelveDataConfigured } from "@/lib/twelve-data";

/** A listing as search reads it, without the stored closes it doesn't need. */
export type ListingRow = Omit<Listing, "closes">;

/** A year of sessions with room for YTD's reach back to last December. */
const LISTING_SESSIONS = 260;

/**
 * On-demand Twelve Data lookups for stocks outside the tracked set, used by
 * search and by an untracked stock's page. Each refresh reserves "search"
 * credits first, updates the rows it was given in place, and on any failure
 * leaves them as they were: a missing price shows as a gap, never an error.
 */
export async function refreshListingPrices(db: PrismaClient, listings: ListingRow[], now: Date) {
  const stale = listings.filter(listing => !isPriceFresh(listing.priceFetchedAt, now));
  if (!isTwelveDataConfigured() || stale.length === 0) return;
  try {
    const symbols = stale.slice(0, await reserveCredits(db, "search", stale.length, now)).map(listing => listing.symbol);
    await Promise.all((await fetchQuotes(symbols)).map(quote => {
      const data = { price: quote.price, changeAbs: quote.changeAbs, changePct: quote.changePct, priceFetchedAt: now };
      Object.assign(stale.find(listing => listing.symbol === quote.symbol)!, data);
      return db.listing.update({ where: { symbol: quote.symbol }, data });
    }));
  } catch (error) {
    console.error("[listing] quotes", error);
  }
}

/** Asked once per stock; Twelve Data having no logo is remembered too. */
export async function refreshListingLogos(db: PrismaClient, listings: ListingRow[], now: Date) {
  const unchecked = listings.filter(listing => !listing.logoCheckedAt);
  if (!isTwelveDataConfigured() || unchecked.length === 0) return;
  const granted = unchecked.slice(0, await reserveCredits(db, "search", unchecked.length, now));
  await Promise.all(granted.map(async listing => {
    try {
      const data = { logoUrl: await fetchLogo(listing.symbol), logoCheckedAt: now };
      Object.assign(listing, data);
      await db.listing.update({ where: { symbol: listing.symbol }, data });
    } catch (error) {
      console.error("[listing] logo", listing.symbol, error);
    }
  }));
}

/** Fetched at most once per settled session. */
export async function refreshListingCloses(db: PrismaClient, listing: Listing, now: Date) {
  const session = latestSettledSession(now);
  if (!isTwelveDataConfigured() || (listing.closesFetchedAt && listing.closesFetchedAt >= session.settled)) return;
  try {
    if ((await reserveCredits(db, "search", 1, now)) === 0) return;
    const rows = ((await fetchDailyCloses([listing.symbol], LISTING_SESSIONS)).get(listing.symbol) ?? [])
      .filter(row => row.date <= session.ymd)
      .sort((a, b) => a.date.localeCompare(b.date));
    const data = { closes: rows.map(row => [row.date, row.close]), closesFetchedAt: now };
    Object.assign(listing, data);
    await db.listing.update({ where: { symbol: listing.symbol }, data });
  } catch (error) {
    console.error("[listing] closes", listing.symbol, error);
  }
}
