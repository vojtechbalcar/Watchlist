import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Compares a bearer token to the expected secret in constant time. Hashing both
 * first gives equal lengths, so the comparison leaks neither content nor length.
 */
export function bearerMatches(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || !authorization) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`));
}

/** Saved state is a few kilobytes; anything far larger is a mistake or abuse. */
export const MAX_STATE_BYTES = 64 * 1024;

/** Reads a JSON body no larger than `maxBytes`. Null for an unreadable body, "too-large" past the cap. */
export async function readJsonBody(request: Request, maxBytes = MAX_STATE_BYTES): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > maxBytes) return "too-large";
  const text = await request.text().catch(() => null);
  if (text === null) return null;
  if (new TextEncoder().encode(text).length > maxBytes) return "too-large";
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
