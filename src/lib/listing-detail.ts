import type { PrismaClient } from "@prisma/client";
import { refreshListingCloses, refreshListingLogos, refreshListingPrices } from "@/lib/listing-refresh";
import { trackedStocks } from "@/lib/explore-data";
import { returnSeries, type SeriesPoint } from "@/lib/market";
import { listingFigures } from "@/lib/watchlist-listing";
import { parseStoredCloses, periodReturn, periods, type Period } from "@/lib/period-returns";

/** Untracked stocks have no sector, so they are measured against the whole market. */
const MARKET_BENCHMARK = "SPY";

export type ListingDetail = {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
  currency: string;
  logoUrl: string | null;
  price: number | null;
  changeAbs: number | null;
  changePct: number | null;
  priceFetchedAt: Date | null;
  /** The latest close the returns run to. */
  closesThrough: string | null;
  benchmark: string;
  returns: { period: Period; stock: number | null; benchmark: number | null; gap: number | null }[];
  /** Cumulative return lines for the chart, both ending at `closesThrough`. */
  series: Record<Period, { stock: SeriesPoint[]; benchmark: SeriesPoint[] }>;
};

/**
 * The page for a stock outside the tracked set. Opening it refreshes the
 * price (when older than 15 minutes), the logo (once), and a year of closes
 * (once per session), all within the on-demand credit budget, then compares
 * the stock with the S&P 500 over each period.
 */
export async function getListingDetail(db: PrismaClient, symbol: string, now = new Date()): Promise<ListingDetail | null> {
  const listing = await db.listing.findUnique({ where: { symbol } });
  if (!listing) return null;

  const [benchmark, benchmarkCloses] = await Promise.all([
    db.instrument.findUnique({ where: { ticker: MARKET_BENCHMARK }, select: { name: true } }),
    db.dailyClose.findMany({ where: { ticker: MARKET_BENCHMARK }, orderBy: { date: "asc" }, select: { date: true, close: true } }),
    refreshListingPrices(db, [listing], now),
    refreshListingLogos(db, [listing], now),
    refreshListingCloses(db, listing, now),
  ]);

  const closes = parseStoredCloses(listing.closes);
  const market = benchmarkCloses.map(row => ({ date: row.date.toISOString().slice(0, 10), close: Number(row.close) }));
  const through = closes.at(-1)?.date ?? null;
  const marketThrough = through ? market.filter(row => row.date <= through) : [];

  return {
    ticker: listing.symbol,
    name: listing.name,
    exchange: listing.exchange,
    type: listing.type,
    currency: listing.currency,
    logoUrl: listing.logoUrl,
    price: listing.price === null ? null : Number(listing.price),
    changeAbs: listing.changeAbs === null ? null : Number(listing.changeAbs),
    changePct: listing.changePct === null ? null : Number(listing.changePct),
    priceFetchedAt: listing.priceFetchedAt,
    closesThrough: through,
    benchmark: benchmark?.name ?? "S&P 500",
    returns: periods.map(period => {
      const stock = periodReturn(closes, period);
      // Measured to the same day as the stock, so both cover the same period.
      const marketReturn = through ? periodReturn(market, period, through) : null;
      return { period, stock, benchmark: marketReturn, gap: stock !== null && marketReturn !== null ? stock - marketReturn : null };
    }),
    series: Object.fromEntries(periods.map(period => [period, { stock: returnSeries(closes, period), benchmark: returnSeries(marketThrough, period) }])) as ListingDetail["series"],
  };
}

export type WatchlistListing = { ticker: string; name: string; currency: string; logoUrl: string | null } & ReturnType<typeof listingFigures>;

/** Enough for a large watchlist; each stale stock can spend a credit. */
export const WATCHLIST_LISTING_LIMIT = 40;

/**
 * Watchlist rows for stocks outside the tracked set. Nothing schedules these:
 * viewing the watchlist refreshes each price older than 15 minutes, a missing
 * logo, and closes once per session, all within the on-demand budget. A
 * symbol that isn't a listing is left out, and the page keeps a gap row.
 */
export async function getWatchlistListings(db: PrismaClient, symbols: string[], now = new Date()): Promise<WatchlistListing[]> {
  const wanted = symbols.filter(symbol => !trackedStocks.some(stock => stock.ticker === symbol)).slice(0, WATCHLIST_LISTING_LIMIT);
  if (!wanted.length) return [];
  const listings = await db.listing.findMany({ where: { symbol: { in: wanted } } });
  await Promise.all([
    refreshListingPrices(db, listings, now),
    refreshListingLogos(db, listings, now),
    ...listings.map(listing => refreshListingCloses(db, listing, now)),
  ]);
  return listings.map(listing => ({
    ticker: listing.symbol,
    name: listing.name,
    currency: listing.currency,
    logoUrl: listing.logoUrl,
    ...listingFigures(listing),
  }));
}
