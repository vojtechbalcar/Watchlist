---
type: checkpoint
updated: 2026-10-19
status: current
---

# Checkpoint — 2026-10-19

Supersedes [[checkpoint-2026-10-16]].

## Working

- Everything in [[checkpoint-2026-10-16]]. PRs #8–#13 are merged: only `main`
  builds migrate, saved stocks refresh on the schedule, the price job's CPU
  cuts, unscheduled closures, and password reset.
- Password reset sends through Resend in production, in the designed email
  ([[password-reset]], [[password-reset-email]]). The user set up the domain
  and secrets and checked the email in real inboxes.
- The price job works again after [[price-job-bind-limit-outage]] (no success
  from 2026-10-18 06:32 to 2026-10-19 10:35 UTC). Scheduled runs return 200
  and `/api/cron/health` reports healthy.
- The hourly Price health workflow (`.github/workflows/price-health.yml`) is
  published, so a stalled job fails a scheduled run and emails the owner.
- The price job uses about 370 ms of CPU in production, down from 650–1,341 ms
  ([[price-refresh-reliability]]).
- Typecheck, ESLint, all 186 tests and the Next.js build pass.

## Needs the user

- Optionally, the Cloudflare rate-limiting rule on `/login` and `/register`.
  Wrangler's login can't manage WAF rules, so it's a dashboard step. The Free
  plan allows one rule matching on path only: 10 requests per 10 seconds per
  IP, blocked for 10 seconds. The app already limits sign-in attempts itself.
- Locally, `pnpm` fails because corepack is too old to verify pnpm's
  signature. `npm i -g corepack@latest` should fix it.

## Not done

- Nothing planned is unbuilt.

## Branches

- Every merged branch was deleted on 2026-10-19, including
  `fix/watchlist-state-test-resolver`, whose `c6877f4` is on `main` as
  `f6c0e2b`. Only `main` remains on GitHub; local `archive/…` branches keep
  old commits.
