---
type: decision
updated: 2026-10-12
status: current
---

# Account security

Related: [[account-pages]], [[settings-preferences]], [[cloudflare-workers-deploy]], [[account-watchlist]]

Settings has a fifth section, **Account & security**, with a password change
and account deletion. Sign-in, registration, and those two actions are
rate-limited. Password reset is **not** built yet: it needs an email provider,
which is still the user's decision.

## Ending sessions

Sessions are signed JWT cookies (see [[account-pages]]), so nothing on the
server could end one before it expired. `User.sessionVersion` is copied into
the token at sign-in. The `jwt` callback in `src/auth.ts` reads the current
version on each server-side `auth()` call. It ends the session when the user
was deleted or the version moved on, as it does after a password change.

- The proxy builds from `auth.config.ts`, which has no database, so it still
  trusts any validly signed cookie. The `(market)` layout catches a session
  that is over and sends it to `/api/account/session-ended`, which clears the
  cookie. Redirecting to `/login` instead loops: the proxy sends a cookie
  holder at `/login` back to `/`.
- A database error during the check keeps the session. Otherwise Auth.js
  deletes the cookie and a database blip signs everyone out.
- The cost is one primary-key read per `auth()` call.
- Tokens issued before this change have no version and count as version 0,
  so nobody was signed out by the deploy.

Rejected: database sessions (Credentials requires JWT); trusting Auth.js's
`trigger: "update"` to re-stamp the version, because a stale token could
revive itself through the client's session update.

## Password change

The action needs the current password. It bumps the version, then signs this
browser in again with the new password and **redirects** to
`/settings?password=changed`.

Symptom first seen: after a successful change the browser bounced between
`/api/account/session-ended` and `/` until Chrome throttled navigation.
Cause: the action re-rendered the page in its own response. `auth()` reads
the `cookie` request header, which still held the old, now-ended token, so
the layout redirected. Next updates `cookies()` after `cookies().set`, but
not `headers()`. Fix: redirect, so the next request carries the new cookie.

## Deletion

Confirmed with the password. Deleting `User` cascades to `SavedWatchlist` and
`SavedPreferences`; then the browser is signed out to `/landing`. The browser's
local copies stay, but the owner key in [[account-watchlist]] keeps another
account from seeing or uploading them.

## Rate limits

`RateLimit` holds fixed-window counters (`src/lib/rate-limit.ts`). Keys hash
the email, address, or user ID, so the table stores no personal data. Every
attempt counts, successful or not.

| Limit | Per | Allowance |
| --- | --- | --- |
| Sign-in | email | 10 / 15 min |
| Sign-in | network address | 30 / 15 min |
| Registration | network address | 5 / hour |
| Password checks in Settings | account | 5 / 15 min |

The sign-in limits are enforced in `authorize`, not the login action. Anyone
can POST to Auth.js's own `/api/auth/callback/credentials`. The address
comes from Cloudflare's `cf-connecting-ip`. The first attempt of each window
deletes ended windows.

Rejected: an in-memory limiter (Workers don't share memory between requests)
and Cloudflare's rate-limiting rules (not in the repo, plan-dependent).

## Verification (2026-10-12)

Tested against a throwaway `prisma dev` database. The serverless adapter
can't reach a local server, so `db.ts` was temporarily swapped for the TCP
adapter; the swap wasn't committed. Results:

- Registering signs in.
- A wrong current password is rejected.
- A password change keeps this browser signed in, and a second session
  (made with curl) got 401 afterwards.
- The 11th bad sign-in for an email returned `code=rate_limited`, and the
  form showed the right message.
- Deletion removed the user and both saved rows, then landed on `/landing`.

Unit tests cover the windows and hashing.
