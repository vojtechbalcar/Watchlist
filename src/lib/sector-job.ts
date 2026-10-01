import type { PrismaClient } from "@prisma/client";
import { fetchSic, fetchTickerMap, secTicker, sectorForSic } from "@/lib/sec-sectors";

/** Companies classified per run: about 11 hours for the whole list, then only new listings. */
export const SECTOR_BATCH = 40;
/** EDGAR allows 10 requests a second. */
const SEC_INTERVAL_MS = 120;

const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Matches every listing to its SEC company number. One request, no Twelve Data credits. */
export async function syncCiks(db: PrismaClient) {
  const map = await fetchTickerMap();
  if (map.size === 0) return 0;
  const listings = await db.listing.findMany({ select: { symbol: true } });
  const matched = listings.flatMap(({ symbol }) => {
    const cik = map.get(symbol) ?? map.get(secTicker(symbol));
    return cik === undefined ? [] : [{ symbol, cik }];
  });
  // One statement for thousands of rows, passed as JSON: the Prisma Postgres driver can't send array parameters.
  // A changed CIK clears the sector check so it is classified again.
  return db.$executeRaw`
    UPDATE "Listing" AS l SET "cik" = v.cik, "sectorCheckedAt" = NULL
    FROM jsonb_to_recordset(${JSON.stringify(matched)}::jsonb) AS v(symbol text, cik int)
    WHERE l."symbol" = v.symbol AND l."cik" IS DISTINCT FROM v.cik`;
}

/** Asks EDGAR for the industry code of companies not yet classified. Returns how many were. */
export async function classifySectors(db: PrismaClient, now: Date, batch = SECTOR_BATCH) {
  const pending = await db.listing.findMany({ where: { cik: { not: null }, sectorCheckedAt: null }, select: { cik: true }, distinct: ["cik"], take: batch });
  const results: { cik: number; sic: number | null }[] = [];
  for (const { cik } of pending) {
    const started = Date.now();
    try {
      results.push({ cik: cik!, sic: await fetchSic(cik!) });
    } catch (error) {
      // Left unchecked, so the next run tries again.
      console.error("[sectors]", cik, error);
    }
    await pause(Math.max(0, SEC_INTERVAL_MS - (Date.now() - started)));
  }
  if (results.length === 0) return 0;
  const rows = results.map(row => ({ ...row, sector: sectorForSic(row.sic) }));
  await db.$executeRaw`
    UPDATE "Listing" AS l SET "sic" = v.sic, "sector" = v.sector, "sectorCheckedAt" = ${now}
    FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS v(cik int, sic int, sector text)
    WHERE l."cik" = v.cik`;
  return results.length;
}
