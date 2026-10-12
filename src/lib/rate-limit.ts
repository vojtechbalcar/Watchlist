import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

/**
 * How many attempts each kind of request gets per window. Sign-in is limited
 * per email (guessing one account's password) and per network address
 * (trying many accounts); registration and password checks inside Settings
 * likewise. Every attempt counts, successful or not.
 */
export const rateLimits = {
  loginEmail: { max: 10, minutes: 15 },
  loginAddress: { max: 30, minutes: 15 },
  register: { max: 5, minutes: 60 },
  accountPassword: { max: 5, minutes: 15 },
} as const;

export type RateLimitName = keyof typeof rateLimits;

/**
 * The ledger row an attempt counts against, and when its window ends.
 * Identifiers are hashed so the table holds no emails or addresses.
 */
export function rateLimitWindow(name: RateLimitName, identifier: string, now: Date) {
  const length = rateLimits[name].minutes * 60 * 1000;
  const start = Math.floor(now.getTime() / length) * length;
  const hashed = createHash("sha256").update(identifier.toLowerCase()).digest("hex").slice(0, 32);
  return { key: `${name}:${hashed}:${new Date(start).toISOString()}`, resetAt: new Date(start + length) };
}

/** Records an attempt and says whether it is within the limit. */
export async function allowAttempt(db: PrismaClient, name: RateLimitName, identifier: string, now = new Date()) {
  const { key, resetAt } = rateLimitWindow(name, identifier, now);
  const row = await db.rateLimit.upsert({ where: { key }, create: { key, count: 1, resetAt }, update: { count: { increment: 1 } } });
  // The first attempt of a window clears the windows that have ended, so the table stays small.
  if (row.count === 1) await db.rateLimit.deleteMany({ where: { resetAt: { lte: now } } });
  return row.count <= rateLimits[name].max;
}

/** The visitor's address as Cloudflare reports it; "unknown" locally. */
export function clientAddress(headers: Headers) {
  return headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
