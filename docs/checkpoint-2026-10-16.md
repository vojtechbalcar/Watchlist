---
type: checkpoint
updated: 2026-10-16
status: current
---

# Checkpoint — 2026-10-16

Supersedes [[checkpoint-2026-10-13]].

## Working

- Everything in [[checkpoint-2026-10-13]], plus the [[codebase-cleanup]] refactor (PR #6) and the UI polish in [[ui-polish]].
- CI on `main` passes again: typecheck, ESLint, and `pnpm test` (169 tests).
- Production prices refresh through the separate scheduler Worker, verified on 2026-10-12 ([[price-refresh-reliability]]).
- Local sign-in works once the local database has every migration ([[cloudflare-workers-deploy]]).
- Only Cloudflare builds of `main` run migrations; other branches skip them.

## Open pull requests

- #8: only `main` builds migrate, `pnpm test`, these notes.
- #9: saved stocks refresh on the schedule (the stranded `c6877f4`), and the price job's two heaviest reads cut from about 900 to 130 ms of CPU locally.
- #10: password reset by email through Postmark ([[password-reset]]).
- #11: announced unscheduled closures treated like holidays.

## Needs the user

- **The price scheduler Worker is gone.** `gowatchlist-price-scheduler` no longer exists on the Cloudflare account, so nothing triggers the price job ([[price-refresh-reliability]]). Redeploying it needs `CRON_SECRET`, which can't be read back from the app Worker.
- Before merging #10: confirm the sender domain in Postmark and set `POSTMARK_SERVER_TOKEN` and `EMAIL_FROM` on the `gowatchlist` Worker.
- The Cloudflare rate-limiting rule on the sign-in pages. Wrangler's login can't manage WAF rules, so it's a dashboard step. The Free plan allows one rule matching on path only: 10 requests per 10 seconds per IP, blocked for 10 seconds.

## Not done

- A production before/after measurement of the price job's CPU, which needs the scheduler running again.

## Branches

- Merged branches were deleted on 2026-10-16. `feature/main`, `feat/loading-states`, `feat/ux-completion` and `landingPage` were deleted from GitHub the same day at the user's request; local `archive/…` branches keep their commits.
- `fix/watchlist-state-test-resolver` still holds `c6877f4`; it can go once #9 merges.
