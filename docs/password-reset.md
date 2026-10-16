---
type: decision
updated: 2026-10-16
status: current
---

# Password reset

Related: [[account-security]], [[account-pages]], [[security-hardening]], [[cloudflare-workers-deploy]]

Email goes through **Resend**. The user first chose Postmark, which the
feature was built and verified with, then switched to Resend on 2026-10-16;
only `src/lib/email.ts` changed. "Forgot your password?" on the login
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
- **Resend over its HTTP API, not an SDK.** One `fetch` from
  `src/lib/email.ts`, which works on Workers. Resend has no per-email
  tracking switch: click and open tracking are per-domain settings, off by
  default, and must stay off. Tracking rewrites the link, and the privacy
  notice promises no tracking.
- **Without Resend,** development prints the email to the dev server's
  terminal; production refuses to send and the page asks to try again later.

Rejected: Cloudflare Email Sending, which the user asked for first. It
emails arbitrary recipients only on the Workers Paid plan; on Free it can
reach only addresses verified in the user's own Cloudflare account. The user
chose to stay on Free. Also rejected: a reset code typed into the form (a link is one step less), storing
plain tokens, and confirming the new password twice (the other forms have a
Show button instead).

## Production setup (needs the user)

1. In Resend, add the `usewatchlist.dev` domain and create its DNS records
   in Cloudflare (Resend lists them: DKIM, SPF, and the MX for bounces).
   Keep click and open tracking off.
2. Create a Resend API key with "Sending access" only.
3. On the `gowatchlist` Worker, add the secrets `RESEND_API_KEY` and
   `EMAIL_FROM`, for example `Watchlist <hello@usewatchlist.dev>`.
3. The `PasswordReset` migration applies in the next build of `main`.

Until the domain is verified, Resend sends only from `onboarding@resend.dev`
and only to the account owner's own address, so reset emails to anyone else
fail. Resend's free tier allows 3,000 emails a month and 100 a day.

## Verification

Nine tests cover the token, the request and reset rules (unknown email,
replacement, expiry, reuse, two requests at once) and the Resend request.
In a browser against the dev database: registered a throwaway account,
requested a reset, followed the link printed in the terminal, set a new
password and landed signed in. Reopening the link showed "This link has
expired", the old password was rejected, and the new one worked. The account
was deleted afterwards. The running dev server had to be restarted to pick
up the new Prisma model, so the check ran on a second server on port 3005.

After the switch to Resend, the email tests were rewritten first and failed
against the Postmark code. The full suite (176), typecheck and ESLint pass.
The browser check was repeated on a second dev server (port 3005), run with
webpack from a copy of the tree, because Turbopack rejects a symlinked
`node_modules`. Requesting a reset printed the email through the new
"Resend isn't configured" fallback. The link set a new password and signed
in, the old password failed, and reopening the link showed it expired.
Sending through Resend itself is untested until the domain and key exist.
