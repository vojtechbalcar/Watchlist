import type { PrismaClient } from "@prisma/client";
import { pruneUsage, reserveCredits } from "@/lib/api-budget";
import { BACKFILL_SESSIONS, TOPUP_SESSIONS, closesDue, latestSettledSession, quotesDue, symbolSyncDue, type TrackedState } from "@/lib/price-schedule";
import { fetchDailyCloses, fetchQuotes, fetchStockList, isTwelveDataConfigured } from "@/lib/twelve-data";

const LISTING_CHUNK = 1000;

/**
 * One run of the scheduled price job. It spends at most the job's per-minute
 * credit allowance, on the symbol list first, then missing daily closes, then
 * the stalest quotes. Whatever doesn't fit waits for the next run.
 */
export async function runPriceJob(db: PrismaClient, now = new Date()) {
  // Checked up front so a missing key doesn't spend ledger credits on calls that can't succeed.
  if (!isTwelveDataConfigured()) throw new Error("TWELVE_DATA_API_KEY is not set");
  const report = { listings: 0, closes: [] as string[], quotes: [] as string[] };
  await pruneUsage(db, now);

  const sync = await db.jobState.findUnique({ where: { job: "symbols" } });
  if (symbolSyncDue(sync?.ranAt ?? null, now) && (await reserveCredits(db, "job", 1, now)) === 1) {
    const stocks = await fetchStockList();
    // New listings only; names of existing ones rarely change and aren't worth 6,000 updates a day.
    for (let i = 0; i < stocks.length; i += LISTING_CHUNK) {
      await db.listing.createMany({ data: stocks.slice(i, i + LISTING_CHUNK), skipDuplicates: true });
    }
    await db.jobState.upsert({ where: { job: "symbols" }, create: { job: "symbols", ranAt: now }, update: { ranAt: now } });
    report.listings = stocks.length;
  }

  const instruments = await db.instrument.findMany({
    select: { ticker: true, closesCheckedAt: true, quote: { select: { fetchedAt: true } }, closes: { select: { date: true }, orderBy: { date: "desc" }, take: 1 } },
  });
  const states: TrackedState[] = instruments.map(instrument => ({
    ticker: instrument.ticker,
    latestClose: instrument.closes[0]?.date.toISOString().slice(0, 10) ?? null,
    closesCheckedAt: instrument.closesCheckedAt,
    quoteFetchedAt: instrument.quote?.fetchedAt ?? null,
  }));

  const due = closesDue(states, now);
  const session = latestSettledSession(now).ymd;
  for (const [group, sessions] of [[due.filter(state => !state.latestClose), BACKFILL_SESSIONS], [due.filter(state => state.latestClose), TOPUP_SESSIONS]] as const) {
    const batch = group.slice(0, await reserveCredits(db, "job", group.length, now)).map(state => state.ticker);
    if (batch.length === 0) continue;
    const closes = await fetchDailyCloses(batch, sessions);
    for (const ticker of batch) {
      // During market hours the series ends with today's unfinished bar; keep settled sessions only.
      const rows = (closes.get(ticker) ?? []).filter(row => row.date <= session);
      if (rows.length) await db.dailyClose.createMany({ data: rows.map(row => ({ ticker, date: new Date(`${row.date}T00:00:00Z`), close: row.close })), skipDuplicates: true });
    }
    // Marked even when Twelve Data returned nothing, so a holiday or a rejected symbol isn't retried every run.
    await db.instrument.updateMany({ where: { ticker: { in: batch } }, data: { closesCheckedAt: now } });
    report.closes.push(...batch);
  }

  const stale = quotesDue(states, now);
  const batch = stale.slice(0, await reserveCredits(db, "job", stale.length, now)).map(state => state.ticker);
  for (const quote of await fetchQuotes(batch)) {
    const data = { price: quote.price, changeAbs: quote.changeAbs, changePct: quote.changePct, asOf: quote.asOf, fetchedAt: now };
    await db.quote.upsert({ where: { ticker: quote.symbol }, create: { ticker: quote.symbol, ...data }, update: data });
    report.quotes.push(quote.symbol);
  }

  return report;
}
