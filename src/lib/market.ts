import { periodReturn, periodWindow, periods, type DatedClose, type Period } from "./period-returns";

/**
 * The market as every signed-in page sees it, computed by the price job from
 * stored closes and quotes. Pure functions here; src/lib/market-build.ts reads
 * the database and stores the result.
 */

export type InstrumentMarket = {
  price: number | null;
  changeAbs: number | null;
  changePct: number | null;
  /** When the price is from, as an ISO time. */
  asOf: string | null;
  returns: Record<Period, number | null>;
};

export type MarketSnapshot = {
  builtAt: string;
  /** The newest quote time across tracked instruments. */
  asOf: string | null;
  instruments: Record<string, InstrumentMarket>;
};

/** [date, cumulative % since the period's start]. */
export type SeriesPoint = [string, number];

export type MarketSeries = {
  builtAt: string;
  series: Record<string, Partial<Record<Period, SeriesPoint[]>>>;
};

/** Enough points for a smooth line at chart width, few enough to send every instrument at once. */
export const MAX_SERIES_POINTS = 60;

export type LiveQuote = { price: number; changeAbs: number; changePct: number; asOf: Date; ymd: string };

/**
 * Stored closes plus the live price as today's point. During market hours
 * the quote is newer than the last close; after the close it is the same day
 * and replaces it, so returns always end at the latest price.
 */
export function withLivePrice(closes: DatedClose[], quote: LiveQuote | null): DatedClose[] {
  if (!quote) return closes;
  const kept = closes.filter(row => row.date < quote.ymd);
  return [...kept, { date: quote.ymd, close: quote.price }];
}

export function instrumentMarket(closes: DatedClose[], quote: LiveQuote | null): InstrumentMarket {
  const series = withLivePrice(closes, quote);
  const returns = Object.fromEntries(periods.map(period => [period, round(periodReturn(series, period))])) as Record<Period, number | null>;
  // The quote's own day change is the exchange's figure; prefer it for 1D.
  if (quote) returns["1D"] = round(quote.changePct);
  return {
    price: quote?.price ?? series.at(-1)?.close ?? null,
    changeAbs: quote ? round(quote.changeAbs) : null,
    changePct: quote ? round(quote.changePct) : returns["1D"],
    asOf: quote?.asOf.toISOString() ?? null,
    returns,
  };
}

/** Cumulative return from the period's start at each close, thinned to at most `maxPoints` (first and last kept). */
export function returnSeries(closes: DatedClose[], period: Period, maxPoints = MAX_SERIES_POINTS): SeriesPoint[] {
  const window = periodWindow(closes, period);
  if (!window) return [];
  const base = window[0].close;
  const points: SeriesPoint[] = window.map(row => [row.date, round((row.close / base - 1) * 100)!]);
  if (points.length <= maxPoints) return points;
  const step = (points.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => points[Math.round(i * step)]);
}

export function instrumentSeries(closes: DatedClose[], quote: LiveQuote | null) {
  const series = withLivePrice(closes, quote);
  return Object.fromEntries(periods.map(period => [period, returnSeries(series, period)])) as Record<Period, SeriesPoint[]>;
}

function round(value: number | null) {
  return value === null ? null : Math.round(value * 10000) / 10000;
}
