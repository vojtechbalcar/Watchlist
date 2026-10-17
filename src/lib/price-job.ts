import type { PrismaClient } from "@prisma/client";
import { pruneUsage, reserveCredits } from "@/lib/api-budget";
import { classifySectors, syncCiks } from "@/lib/sector-job";
import { rebuildDirectory } from "@/lib/stock-directory";
import { buildMarket } from "@/lib/market-build";
import { BACKFILL_SESSIONS, TOPUP_SESSIONS, closesDue, latestSettledSession, quotesDue, symbolSyncDue, type TrackedState } from "@/lib/price-schedule";
import { fetchDailyCloses, fetchQuotes, fetchStockList, isTwelveDataConfigured } from "@/lib/twelve-data";
import { parseStoredCloses } from "@/lib/period-returns";
import { isWatchlistTicker } from "@/lib/watchlist-catalog";

// Fewer HTTP database requests when a stale symbol directory catches up.
const LISTING_CHUNK = 4000;

/** Only saved, existing listings outside Instrument join the shared rotation. */
async function readSavedListings(db: PrismaClient, tracked: TrackedState[]) {
  const saved = await db.savedWatchlist.findMany({ select: { state: true } });
  const excluded = new Set(tracked.map(state => state.ticker));
  const symbols = new Set<string>();
  for (const { state } of saved) {
    if (!state || typeof state !== "object" || Array.isArray(state) || !Array.isArray(state.tickers)) continue;
    for (const ticker of state.tickers) {
      if (typeof ticker === "string" && isWatchlistTicker(ticker) && !excluded.has(ticker)) symbols.add(ticker);
    }
  }
  return symbols.size ? db.listing.findMany({
    where: { symbol: { in: [...symbols] } },
    select: { symbol: true, closes: true, closesFetchedAt: true, priceFetchedAt: true },
  }) : [];
}

/** What the job knows about each tracked instrument; also read by the health check. */
export async function readTrackedStates(db: PrismaClient): Promise<TrackedState[]> {
  // Two flat queries: a nested "latest close" per instrument cost about ten times the CPU.
  const [instruments, latest] = await Promise.all([
    db.instrument.findMany({ select: { ticker: true, closesCheckedAt: true, quote: { select: { fetchedAt: true } } } }),
    db.dailyClose.groupBy({ by: ["ticker"], _max: { date: true } }),
  ]);
  const latestClose = new Map(latest.map(row => [row.ticker, row._max.date]));
  return instruments.map(instrument => ({
    ticker: instrument.ticker,
    latestClose: latestClose.get(instrument.ticker)?.toISOString().slice(0, 10) ?? null,
    closesCheckedAt: instrument.closesCheckedAt,
    quoteFetchedAt: instrument.quote?.fetchedAt ?? null,
  }));
}

/**
 * One run of the scheduled price job. It first classifies a batch of listings
 * by sector from the SEC, which is free. Then it spends at most the job's
 * per-minute credit allowance, on the symbol list first, then missing daily
 * closes, then the stalest quotes. Whatever doesn't fit waits for the next run.
 */
export async function runPriceJob(db: PrismaClient, now = new Date()) {
  const report = { listings: 0, ciks: 0, sectors: 0, closes: [] as string[], quotes: [] as string[] };

  // Sectors come from the SEC, not Twelve Data, so they cost no credits and don't need the key.
  try {
    const cikSync = await db.jobState.findUnique({ where: { job: "sec-ciks" } });
    if (symbolSyncDue(cikSync?.ranAt ?? null, now)) {
      report.ciks = await syncCiks(db);
      await db.jobState.upsert({ where: { job: "sec-ciks" }, create: { job: "sec-ciks", ranAt: now }, update: { ranAt: now } });
    }
    report.sectors = await classifySectors(db, now);
    if (report.ciks || report.sectors) await rebuildDirectory(db, now);
  } catch (error) {
    console.error("[sectors]", error);
  }

  // Checked here so a missing key doesn't spend ledger credits on calls that can't succeed.
  if (!isTwelveDataConfigured()) throw new Error("TWELVE_DATA_API_KEY is not set");
  await pruneUsage(db, now);

  const sync = await db.jobState.findUnique({ where: { job: "symbols" } });
  if (symbolSyncDue(sync?.ranAt ?? null, now) && (await reserveCredits(db, "job", 1, now)) === 1) {
    const stocks = await fetchStockList();
    // New listings only; names of existing ones rarely change and aren't worth 6,000 updates a day.
    for (let i = 0; i < stocks.length; i += LISTING_CHUNK) {
      await db.listing.createMany({ data: stocks.slice(i, i + LISTING_CHUNK), skipDuplicates: true });
    }
    await db.jobState.upsert({ where: { job: "symbols" }, create: { job: "symbols", ranAt: now }, update: { ranAt: now } });
    await rebuildDirectory(db, now);
    report.listings = stocks.length;
  }

  const tracked = await readTrackedStates(db);
  const listings = await readSavedListings(db, tracked);
  const saved = new Map(listings.map(listing => [listing.symbol, listing]));
  const states = [...tracked, ...listings.map(listing => ({
    ticker: listing.symbol,
    latestClose: parseStoredCloses(listing.closes).at(-1)?.date ?? null,
    closesCheckedAt: listing.closesFetchedAt,
    quoteFetchedAt: listing.priceFetchedAt,
  }))];

  const candidates = closesDue(states, now);
  // Reserve before splitting backfills/top-ups, retaining one oldest-first queue.
  const due = candidates.slice(0, await reserveCredits(db, "job", candidates.length, now));
  const session = latestSettledSession(now).ymd;
  for (const [group, sessions] of [[due.filter(state => !state.latestClose), BACKFILL_SESSIONS], [due.filter(state => state.latestClose), TOPUP_SESSIONS]] as const) {
    const batch = group.map(state => state.ticker);
    if (batch.length === 0) continue;
    const closes = await fetchDailyCloses(batch, sessions);
    for (const ticker of batch) {
      // During market hours the series ends with today's unfinished bar; keep settled sessions only.
      const rows = (closes.get(ticker) ?? []).filter(row => row.date <= session);
      const listing = saved.get(ticker);
      if (listing) {
        // A short top-up must not erase the year of history used by comparisons.
        const history = new Map(parseStoredCloses(listing.closes).map(row => [row.date, row.close]));
        for (const row of rows) history.set(row.date, row.close);
        const closes = [...history].sort(([a], [b]) => a.localeCompare(b)).slice(-BACKFILL_SESSIONS);
        await db.listing.update({ where: { symbol: ticker }, data: { closes, closesFetchedAt: now } });
      } else if (rows.length) {
        await db.dailyClose.createMany({ data: rows.map(row => ({ ticker, date: new Date(`${row.date}T00:00:00Z`), close: row.close })), skipDuplicates: true });
      }
    }
    // Marked even when Twelve Data returned nothing, so a holiday or a rejected symbol isn't retried every run.
    const instrumentBatch = batch.filter(ticker => !saved.has(ticker));
    if (instrumentBatch.length) await db.instrument.updateMany({ where: { ticker: { in: instrumentBatch } }, data: { closesCheckedAt: now } });
    report.closes.push(...batch);
  }

  const stale = quotesDue(states, now);
  const batch = stale.slice(0, await reserveCredits(db, "job", stale.length, now)).map(state => state.ticker);
  for (const quote of await fetchQuotes(batch)) {
    const data = { price: quote.price, changeAbs: quote.changeAbs, changePct: quote.changePct, asOf: quote.asOf, fetchedAt: now };
    if (saved.has(quote.symbol)) {
      await db.listing.update({ where: { symbol: quote.symbol }, data: {
        price: quote.price, changeAbs: quote.changeAbs, changePct: quote.changePct, priceFetchedAt: now,
      } });
    } else {
      await db.quote.upsert({ where: { ticker: quote.symbol }, create: { ticker: quote.symbol, ...data }, update: data });
    }
    report.quotes.push(quote.symbol);
  }

  // Every page reads the market from one stored snapshot; refresh it whenever its inputs moved.
  if ([...report.closes, ...report.quotes].some(ticker => !saved.has(ticker))) await buildMarket(db, now);
  return report;
}
