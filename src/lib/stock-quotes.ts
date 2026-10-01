import type { PrismaClient } from "@prisma/client";
import { refreshListingLogos, refreshListingPrices } from "@/lib/listing-refresh";
import type { StockQuote } from "@/lib/search-ranking";

/** Search shows six results; only those may spend credits. */
export const LIVE_LIMIT = 6;

/**
 * Prices for the given stocks. Tracked ones carry the price job's quote.
 * With `live`, untracked ones without a price from the last 15 minutes are
 * priced now, and given a logo if they have never had one, within the
 * on-demand credit budget. Without it, this only reads what is stored.
 */
export async function getQuotes(db: PrismaClient, symbols: string[], live: boolean, now = new Date()) {
  const [listings, instruments] = await Promise.all([
    db.listing.findMany({ where: { symbol: { in: symbols } }, omit: { closes: true } }),
    db.instrument.findMany({ where: { ticker: { in: symbols } }, select: { ticker: true, currency: true, quote: true } }),
  ]);
  const tracked = new Map(instruments.map(instrument => [instrument.ticker, instrument]));
  const untracked = listings.filter(listing => !tracked.has(listing.symbol));

  if (live) {
    const visible = untracked.filter(listing => symbols.indexOf(listing.symbol) < LIVE_LIMIT);
    // Prices before logos, so a short budget goes where it matters.
    await refreshListingPrices(db, visible, now);
    await refreshListingLogos(db, visible, now);
  }

  const quotes: Record<string, StockQuote> = {};
  for (const instrument of instruments) {
    const quote = instrument.quote;
    quotes[instrument.ticker] = { price: quote ? Number(quote.price) : null, changePct: quote ? Number(quote.changePct) : null, currency: instrument.currency, logoUrl: null };
  }
  for (const listing of untracked) {
    quotes[listing.symbol] = {
      price: listing.price === null ? null : Number(listing.price),
      changePct: listing.changePct === null ? null : Number(listing.changePct),
      currency: listing.currency,
      logoUrl: listing.logoUrl,
    };
  }
  return quotes;
}
