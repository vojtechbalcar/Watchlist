import { instrumentMarket, instrumentSeries, type LiveQuote, type SeriesPoint } from "./market";
import { parseStoredCloses, type Period } from "./period-returns";
import { sessionOpenedBy } from "./price-schedule";

/** The Listing columns a watchlist row needs; prices are Prisma decimals or plain numbers. */
export type ListingPrices = {
  closes: unknown;
  price: unknown;
  changeAbs: unknown;
  changePct: unknown;
  priceFetchedAt: Date | null;
};

const toNumber = (value: unknown) => (value === null || value === undefined ? null : Number(value));

/**
 * A stock outside the tracked set, figured the way the price job figures a
 * tracked one: its cached closes, with the cached price as the latest
 * session's point, so returns and lines end at the price the row shows.
 */
export function listingFigures(listing: ListingPrices) {
  const closes = parseStoredCloses(listing.closes);
  const price = toNumber(listing.price);
  const quote: LiveQuote | null = price !== null && listing.priceFetchedAt
    ? {
      price,
      changeAbs: toNumber(listing.changeAbs) ?? 0,
      changePct: toNumber(listing.changePct) ?? 0,
      asOf: listing.priceFetchedAt,
      ymd: sessionOpenedBy(listing.priceFetchedAt),
    }
    : null;
  const market = instrumentMarket(closes, quote);
  return {
    price: market.price,
    changeAbs: market.changeAbs,
    changePct: market.changePct,
    returns: market.returns,
    series: instrumentSeries(closes, quote) as Record<Period, SeriesPoint[]>,
  };
}
