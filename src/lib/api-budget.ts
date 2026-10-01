import type { PrismaClient } from "@prisma/client";

/**
 * Twelve Data's free plan allows 8 credits a minute and 800 a day, shared by
 * every caller. The price job stops short of both so search always has room.
 */
export const creditLimits = {
  job: { minute: 6, day: 600 },
  search: { minute: 8, day: 800 },
} as const;

export type Caller = keyof typeof creditLimits;

/** Ledger buckets for the UTC minute and UTC day of `now`. */
export function usageBuckets(now: Date) {
  const iso = now.toISOString();
  return { minute: `m:${iso.slice(0, 16)}`, day: `d:${iso.slice(0, 10)}` };
}

/**
 * How many of `wanted` credits fit, given the totals after adding all of them.
 * The rest is handed back, so concurrent callers can't both overspend.
 */
export function creditsGranted(wanted: number, minuteTotal: number, dayTotal: number, caller: Caller) {
  const limit = creditLimits[caller];
  const excess = Math.max(minuteTotal - limit.minute, dayTotal - limit.day, 0);
  return Math.max(wanted - excess, 0);
}

/** Reserves up to `wanted` credits and returns how many were granted. */
export async function reserveCredits(db: PrismaClient, caller: Caller, wanted: number, now = new Date()) {
  if (wanted <= 0) return 0;
  const buckets = usageBuckets(now);
  const add = (bucket: string, credits: number) =>
    db.apiUsage.upsert({ where: { bucket }, create: { bucket, credits }, update: { credits: { increment: credits } } });
  const [minute, day] = await Promise.all([add(buckets.minute, wanted), add(buckets.day, wanted)]);
  const granted = creditsGranted(wanted, minute.credits, day.credits, caller);
  if (granted < wanted) await Promise.all([add(buckets.minute, granted - wanted), add(buckets.day, granted - wanted)]);
  return granted;
}

/** Minute buckets are only needed for the current minute; drop the old ones. */
export async function pruneUsage(db: PrismaClient, now = new Date()) {
  const cutoff = usageBuckets(new Date(now.getTime() - 60 * 60 * 1000)).minute;
  await db.apiUsage.deleteMany({ where: { bucket: { startsWith: "m:", lt: cutoff } } });
}
