import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

/** How long an emailed link works. */
export const RESET_LINK_MINUTES = 60;

/** 32 random bytes for the link; the database keeps only their SHA-256. */
export function createResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

type Send = (to: string, link: string) => Promise<void>;

/**
 * Emails a reset link when the address has an account. Returns true either
 * way, so the page says the same thing for every address. The account's older
 * links and everyone's expired ones are deleted first.
 */
export async function requestPasswordReset(db: PrismaClient, { email, origin, now, send }: { email: string; origin: string; now: Date; send: Send }) {
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return true;
  const { token, tokenHash } = createResetToken();
  await db.passwordReset.deleteMany({ where: { OR: [{ userId: user.id }, { expiresAt: { lte: now } }] } });
  await db.passwordReset.create({ data: { tokenHash, userId: user.id, expiresAt: new Date(now.getTime() + RESET_LINK_MINUTES * 60_000) } });
  const link = new URL("/reset-password", origin);
  link.searchParams.set("token", token);
  await send(email, link.toString());
  return true;
}

/** Whether a link can still be used, for the page to say so before the form. */
export async function resetLinkValid(db: PrismaClient, token: string, now: Date) {
  const reset = await db.passwordReset.findUnique({ where: { tokenHash: hashResetToken(token) } });
  return Boolean(reset && reset.expiresAt > now);
}

/**
 * Sets the password a valid link was sent for and returns the account's email,
 * or null for an unknown, expired, or already used link. Deleting the link
 * before the update means two requests with it can't both succeed. Raising
 * sessionVersion signs out every session, as a password change does.
 */
export async function consumePasswordReset(db: PrismaClient, { token, passwordHash, now }: { token: string; passwordHash: string; now: Date }) {
  const tokenHash = hashResetToken(token);
  const reset = await db.passwordReset.findUnique({ where: { tokenHash }, include: { user: { select: { email: true } } } });
  if (!reset || reset.expiresAt <= now) return null;
  const { count } = await db.passwordReset.deleteMany({ where: { tokenHash } });
  if (count === 0) return null;
  await db.user.update({ where: { id: reset.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } });
  await db.passwordReset.deleteMany({ where: { userId: reset.userId } });
  return reset.user.email;
}
