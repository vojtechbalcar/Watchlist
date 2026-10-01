import type { PrismaClient } from "@prisma/client";
import { instrumentMarket, instrumentSeries, type LiveQuote, type MarketSeries, type MarketSnapshot } from "@/lib/market";
import type { DatedClose } from "@/lib/period-returns";
import { nyClock } from "@/lib/price-schedule";

const MARKET_KEY = "market";
const SERIES_KEY = "market-series";
/** 1Y reaches back to the same date last year; a little more covers holidays. */
const HISTORY_DAYS = 380;

/**
 * Recomputes every tracked instrument's price, returns, and return lines from
 * stored closes and quotes, and stores them as two snapshots: the small one
 * every signed-in page reads, and the series only charts load.
 */
export async function buildMarket(db: PrismaClient, now = new Date()) {
  const since = new Date(now.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const [instruments, closes] = await Promise.all([
    db.instrument.findMany({ select: { ticker: true, quote: true } }),
    db.dailyClose.findMany({ where: { date: { gte: since } }, orderBy: [{ ticker: "asc" }, { date: "asc" }], select: { ticker: true, date: true, close: true } }),
  ]);

  const byTicker = new Map<string, DatedClose[]>();
  for (const row of closes) {
    const list = byTicker.get(row.ticker) ?? [];
    list.push({ date: row.date.toISOString().slice(0, 10), close: Number(row.close) });
    byTicker.set(row.ticker, list);
  }

  const market: MarketSnapshot = { builtAt: now.toISOString(), asOf: null, instruments: {} };
  const series: MarketSeries = { builtAt: now.toISOString(), series: {} };
  for (const { ticker, quote } of instruments) {
    const live: LiveQuote | null = quote && {
      price: Number(quote.price), changeAbs: Number(quote.changeAbs), changePct: Number(quote.changePct),
      asOf: quote.asOf, ymd: nyClock(quote.asOf).ymd,
    };
    const history = byTicker.get(ticker) ?? [];
    market.instruments[ticker] = instrumentMarket(history, live);
    series.series[ticker] = instrumentSeries(history, live);
    if (live && (!market.asOf || live.asOf.toISOString() > market.asOf)) market.asOf = live.asOf.toISOString();
  }

  await Promise.all([
    db.snapshot.upsert({ where: { key: MARKET_KEY }, create: { key: MARKET_KEY, body: JSON.stringify(market), builtAt: now }, update: { body: JSON.stringify(market), builtAt: now } }),
    db.snapshot.upsert({ where: { key: SERIES_KEY }, create: { key: SERIES_KEY, body: JSON.stringify(series), builtAt: now }, update: { body: JSON.stringify(series), builtAt: now } }),
  ]);
  return market;
}

/** The stored market, built on first use if the price job hasn't made one yet. */
export async function readMarket(db: PrismaClient): Promise<MarketSnapshot> {
  const snapshot = await db.snapshot.findUnique({ where: { key: MARKET_KEY } });
  return snapshot ? (JSON.parse(snapshot.body) as MarketSnapshot) : buildMarket(db);
}

/** The stored return lines, as text for the series route to send unparsed. */
export async function readMarketSeries(db: PrismaClient) {
  const snapshot = await db.snapshot.findUnique({ where: { key: SERIES_KEY } });
  if (snapshot) return snapshot;
  await buildMarket(db);
  return db.snapshot.findUniqueOrThrow({ where: { key: SERIES_KEY } });
}
