import type { PrismaClient } from "@prisma/client";
import type { DirectoryPayload } from "@/lib/search-ranking";

/**
 * Every stock search can find, compact enough to send to the browser once
 * (~6,400 rows) so matching happens there as the user types. Tracked stocks
 * keep their hand-picked name and sector; the rest use the SEC's.
 */
export async function loadDirectory(db: PrismaClient): Promise<DirectoryPayload> {
  const [listings, instruments] = await Promise.all([
    db.listing.findMany({ select: { symbol: true, name: true, exchange: true, sector: true }, orderBy: { symbol: "asc" } }),
    db.instrument.findMany({ where: { kind: "STOCK" }, select: { ticker: true, name: true, sector: true } }),
  ]);
  const tracked = new Map(instruments.map(instrument => [instrument.ticker, instrument]));
  const exchanges: string[] = [];
  const sectors: string[] = [];
  const indexOf = (list: string[], value: string | null) => {
    if (!value) return -1;
    const at = list.indexOf(value);
    return at >= 0 ? at : list.push(value) - 1;
  };

  const stocks: DirectoryPayload["stocks"] = listings.map(listing => {
    const instrument = tracked.get(listing.symbol);
    return [listing.symbol, instrument?.name ?? listing.name, indexOf(exchanges, listing.exchange), indexOf(sectors, instrument?.sector ?? listing.sector), instrument ? 1 : 0];
  });
  // Tracked stocks are findable even before the first symbol sync.
  const listed = new Set(listings.map(listing => listing.symbol));
  for (const instrument of instruments) {
    if (!listed.has(instrument.ticker)) stocks.push([instrument.ticker, instrument.name, -1, indexOf(sectors, instrument.sector), 1]);
  }
  return { exchanges, sectors, stocks };
}

const SNAPSHOT_KEY = "stock-directory";

/** Builds the directory and stores it, so requests serve stored text instead of assembling 6,400 rows. */
export async function rebuildDirectory(db: PrismaClient, now = new Date()) {
  const data = { body: JSON.stringify(await loadDirectory(db)), builtAt: now };
  return db.snapshot.upsert({ where: { key: SNAPSHOT_KEY }, create: { key: SNAPSHOT_KEY, ...data }, update: data });
}

/** The stored directory, built on first use if the price job hasn't made one yet. */
export async function readDirectory(db: PrismaClient) {
  return (await db.snapshot.findUnique({ where: { key: SNAPSHOT_KEY } })) ?? rebuildDirectory(db);
}
