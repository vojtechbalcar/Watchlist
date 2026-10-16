import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { RESET_LINK_MINUTES, consumePasswordReset, createResetToken, hashResetToken, requestPasswordReset } = await import("../src/lib/password-reset.ts");

const now = new Date("2026-10-16T09:00:00Z");
const minutes = n => new Date(now.getTime() + n * 60_000);

function fixture({ users = [], resets = [] } = {}) {
  const sent = [];
  const db = {
    user: {
      findUnique: async ({ where }) => users.find(user => user.email === where.email) ?? null,
      update: async ({ where, data }) => {
        const user = users.find(row => row.id === where.id);
        user.passwordHash = data.passwordHash;
        user.sessionVersion += data.sessionVersion.increment;
        return user;
      },
    },
    passwordReset: {
      findUnique: async ({ where }) => {
        const reset = resets.find(row => row.tokenHash === where.tokenHash);
        return reset ? { ...reset, user: users.find(user => user.id === reset.userId) } : null;
      },
      create: async ({ data }) => { resets.push({ ...data }); },
      deleteMany: async ({ where }) => {
        const doomed = resets.filter(row => (where.tokenHash ? row.tokenHash === where.tokenHash : true)
          && (where.userId ? row.userId === where.userId : true)
          && (where.OR ? where.OR.some(or => (or.userId && row.userId === or.userId) || (or.expiresAt && row.expiresAt <= or.expiresAt.lte)) : true));
        for (const row of doomed) resets.splice(resets.indexOf(row), 1);
        return { count: doomed.length };
      },
    },
  };
  return { db, sent, send: async (to, link) => sent.push({ to, link }), users, resets };
}

test("a reset token is long, URL-safe, unique, and stored only as its hash", () => {
  const a = createResetToken();
  const b = createResetToken();
  assert.match(a.token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(a.token, b.token);
  assert.equal(a.tokenHash, hashResetToken(a.token));
  assert.notEqual(a.tokenHash, a.token);
});

test("an unknown email gets the same answer and no link is made or sent", async () => {
  const { db, sent, send, resets } = fixture();
  assert.equal(await requestPasswordReset(db, { email: "nobody@example.com", origin: "https://usewatchlist.dev", now, send }), true);
  assert.deepEqual(sent, []);
  assert.deepEqual(resets, []);
});

test("a known email gets one hour-long link that replaces the account's older links", async () => {
  const user = { id: "u1", email: "ada@example.com", passwordHash: "old", sessionVersion: 0 };
  const { db, sent, send, resets } = fixture({
    users: [user],
    resets: [{ tokenHash: "older", userId: "u1", expiresAt: minutes(30) }, { tokenHash: "stale", userId: "u2", expiresAt: minutes(-1) }, { tokenHash: "other", userId: "u2", expiresAt: minutes(30) }],
  });
  await requestPasswordReset(db, { email: "ada@example.com", origin: "https://usewatchlist.dev", now, send });

  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "ada@example.com");
  const link = new URL(sent[0].link);
  assert.equal(link.origin + link.pathname, "https://usewatchlist.dev/reset-password");
  const token = link.searchParams.get("token");
  assert.deepEqual(resets.map(row => row.tokenHash).sort(), [hashResetToken(token), "other"].sort());
  const fresh = resets.find(row => row.userId === "u1");
  assert.equal(fresh.expiresAt.getTime(), minutes(RESET_LINK_MINUTES).getTime());
});

test("a valid link sets the new password once, ends other sessions, and clears the account's links", async () => {
  const user = { id: "u1", email: "ada@example.com", passwordHash: "old", sessionVersion: 3 };
  const { token, tokenHash } = createResetToken();
  const { db, users, resets } = fixture({ users: [user], resets: [{ tokenHash, userId: "u1", expiresAt: minutes(10) }, { tokenHash: "another", userId: "u1", expiresAt: minutes(10) }] });

  assert.equal(await consumePasswordReset(db, { token, passwordHash: "new", now }), "ada@example.com");
  assert.equal(users[0].passwordHash, "new");
  assert.equal(users[0].sessionVersion, 4);
  assert.deepEqual(resets, []);
  assert.equal(await consumePasswordReset(db, { token, passwordHash: "again", now }), null);
  assert.equal(users[0].passwordHash, "new");
});

test("an expired or unknown link changes nothing", async () => {
  const user = { id: "u1", email: "ada@example.com", passwordHash: "old", sessionVersion: 0 };
  const { token, tokenHash } = createResetToken();
  const { db, users } = fixture({ users: [user], resets: [{ tokenHash, userId: "u1", expiresAt: now }] });
  assert.equal(await consumePasswordReset(db, { token, passwordHash: "new", now }), null);
  assert.equal(await consumePasswordReset(db, { token: "made-up", passwordHash: "new", now }), null);
  assert.equal(users[0].passwordHash, "old");
  assert.equal(users[0].sessionVersion, 0);
});

test("a link used by two requests at once sets the password only once", async () => {
  const user = { id: "u1", email: "ada@example.com", passwordHash: "old", sessionVersion: 0 };
  const { token, tokenHash } = createResetToken();
  const { db, users } = fixture({ users: [user], resets: [{ tokenHash, userId: "u1", expiresAt: minutes(10) }] });
  const results = await Promise.all([consumePasswordReset(db, { token, passwordHash: "first", now }), consumePasswordReset(db, { token, passwordHash: "second", now })]);
  assert.deepEqual(results.filter(Boolean), ["ada@example.com"]);
  assert.equal(users[0].sessionVersion, 1);
});
