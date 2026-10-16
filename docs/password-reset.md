---
type: decision
updated: 2026-10-16
status: current
---

# Password reset

Related: [[account-security]], [[account-pages]], [[security-hardening]], [[cloudflare-workers-deploy]]

The user chose **Postmark** for email. "Forgot your password?" on the login
page leads to `/forgot-password`, which emails a link to
`/reset-password?token=…`. Choosing a new password there signs the visitor in.

## Decisions

- **Hashed, single-use, one-hour tokens.** 32 random bytes, sent as base64url;
  `PasswordReset` stores only the SHA-256, so a database leak can't be turned
  into working links. A new request deletes the account's older links and
  everyone's expired ones. Using a link deletes it before the password
  changes, so two requests with the same link can't both succeed.
- **A reset ends every session.** It raises `sessionVersion`, like a
  password change ([[account-security]]), so a session someone else holds
  ends too.
- **The same answer for every address.** The page never says whether an
  account exists. Registration already reveals that, so this only avoids
  adding a second way. A failed send is reported honestly, which can reveal
  it; a silent failure would leave people waiting for an email.
- **The link's host comes from `Host` only.** `X-Forwarded-Host` is whatever
  the client sends, and trusting it would let anyone have a victim emailed a
  link to their own site carrying a valid token. Cloudflare routes by `Host`.
  Local hosts get `http`, everything else `https`.
- **Rate limits.** 3 requests per email and 10 per network address per hour,
  in the existing `RateLimit` ledger. Guessing a token isn't practical, so
  the reset form itself isn't limited.
- **Postmark over its HTTP API, not an SDK.** One `fetch` from
  `src/lib/email.ts`, which works on Workers. Link and open tracking are off:
  tracking rewrites the link, and the privacy notice promises no tracking.
- **Without Postmark,** development prints the email to the dev server's
  terminal; production refuses to send and the page asks to try again later.

Rejected: a reset code typed into the form (a link is one step less), storing
plain tokens, and confirming the new password twice (the other forms have a
Show button instead).

## Production setup (needs the user)

1. In Postmark, create a server and confirm a sender signature or the
   `usewatchlist.dev` domain (DKIM and Return-Path DNS records).
2. On the `gowatchlist` Worker, add the secrets `POSTMARK_SERVER_TOKEN` (the
   server's API token) and `EMAIL_FROM`, for example
   `Watchlist <hello@usewatchlist.dev>`.
3. The `PasswordReset` migration applies in the next build of `main`.

New Postmark accounts start in test mode and can send only to addresses on
the account's own domain until Postmark approves them.

## Verification

Nine tests cover the token, the request and reset rules (unknown email,
replacement, expiry, reuse, two requests at once) and the Postmark request.
In a browser against the dev database: registered a throwaway account,
requested a reset, followed the link printed in the terminal, set a new
password and landed signed in. Reopening the link showed "This link has
expired", the old password was rejected, and the new one worked. The account
was deleted afterwards. The running dev server had to be restarted to pick
up the new Prisma model, so the check ran on a second server on port 3005.
