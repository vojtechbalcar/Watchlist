import type { Prisma, PrismaClient } from "@prisma/client";
import { sectors } from "@/lib/explore-data";
import { isWatchlistTicker } from "@/lib/watchlist-catalog";
import { parsePreferences, type Preferences } from "@/lib/preferences";
import { parseWatchlist, type WatchlistState } from "@/lib/watchlist-state";

/** Anything stored or sent goes through the same parser as the browser copy, so bad input becomes a valid list. */
const clean = (value: unknown) => parseWatchlist(JSON.stringify(value ?? null), isWatchlistTicker, sectors);

/** The account's watchlist, or null when it has never saved one. */
export async function readSavedWatchlist(db: PrismaClient, userId: string): Promise<WatchlistState | null> {
  const row = await db.savedWatchlist.findUnique({ where: { userId }, select: { state: true } });
  return row ? clean(row.state) : null;
}

export async function saveWatchlist(db: PrismaClient, userId: string, value: unknown): Promise<WatchlistState> {
  const state = clean(value);
  const json = state as unknown as Prisma.InputJsonValue;
  await db.savedWatchlist.upsert({ where: { userId }, create: { userId, state: json }, update: { state: json } });
  return state;
}

/** Preferences are stored the same way, through the browser's own parser. */
const cleanPreferences = (value: unknown) => parsePreferences(JSON.stringify(value ?? null));

export async function readSavedPreferences(db: PrismaClient, userId: string): Promise<Preferences | null> {
  const row = await db.savedPreferences.findUnique({ where: { userId }, select: { state: true } });
  return row ? cleanPreferences(row.state) : null;
}

export async function savePreferences(db: PrismaClient, userId: string, value: unknown): Promise<Preferences> {
  const state = cleanPreferences(value);
  const json = state as unknown as Prisma.InputJsonValue;
  await db.savedPreferences.upsert({ where: { userId }, create: { userId, state: json }, update: { state: json } });
  return state;
}
