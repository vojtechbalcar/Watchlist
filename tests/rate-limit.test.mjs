import assert from "node:assert/strict";
import test from "node:test";
import { allowAttempt, clientAddress, rateLimitWindow, rateLimits } from "../src/lib/rate-limit.ts";

test("attempts in one window share a row, which resets at the window's end", () => {
  const first = rateLimitWindow("loginEmail", "someone@example.test", new Date("2026-10-12T15:46:10Z"));
  const later = rateLimitWindow("loginEmail", "someone@example.test", new Date("2026-10-12T15:59:59Z"));
  const next = rateLimitWindow("loginEmail", "someone@example.test", new Date("2026-10-12T16:00:00Z"));
  assert.equal(first.key, later.key);
  assert.notEqual(first.key, next.key);
  assert.equal(first.resetAt.toISOString(), "2026-10-12T16:00:00.000Z");
});

test("the ledger stores neither emails nor addresses, and ignores email case", () => {
  const now = new Date("2026-10-12T15:00:00Z");
  const { key } = rateLimitWindow("loginEmail", "Someone@Example.test", now);
  assert.doesNotMatch(key, /someone|example/i);
  assert.equal(key, rateLimitWindow("loginEmail", "someone@example.test", now).key);
  assert.notEqual(key, rateLimitWindow("register", "someone@example.test", now).key);
});

test("the attempt after the limit is refused", async () => {
  const counts = new Map();
  const db = { rateLimit: {
    upsert: async ({ where }) => ({ count: counts.set(where.key, (counts.get(where.key) ?? 0) + 1).get(where.key) }),
    deleteMany: async () => ({ count: 0 }),
  } };
  const results = [];
  for (let i = 0; i <= rateLimits.register.max; i++) results.push(await allowAttempt(db, "register", "203.0.113.9"));
  assert.deepEqual(results, [...Array(rateLimits.register.max).fill(true), false]);
});

test("the address comes from Cloudflare's header first", () => {
  assert.equal(clientAddress(new Headers({ "cf-connecting-ip": "203.0.113.9", "x-forwarded-for": "198.51.100.1" })), "203.0.113.9");
  assert.equal(clientAddress(new Headers({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" })), "198.51.100.1");
  assert.equal(clientAddress(new Headers()), "unknown");
});
