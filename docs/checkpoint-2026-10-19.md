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

- Nothing. The user added the Cloudflare rate-limiting rule on `/login` and
  `/register` (10 requests per 10 seconds per IP, blocked for 10 seconds);
  the 11th request in a burst returns 429.

## Local tooling

- `pnpm` failed locally twice over. First, corepack was too old to verify
  pnpm's signature; the user updated it to 0.36.0. Then corepack, finding no
  `packageManager` in Watchlist's `package.json`, walked up to
  `~/package.json`, an unrelated yarn project ("jan-muller-web") in the home
  folder, and refused. `package.json` now pins `pnpm@10.34.7`, and CI reads
  that pin instead of its own `version: 10`. CI and the Cloudflare build pass
  with it.

## Not done

- Nothing planned is unbuilt.

## Branches

- Every merged branch was deleted on 2026-10-19, including
  `fix/watchlist-state-test-resolver`, whose `c6877f4` is on `main` as
  `f6c0e2b`. Only `main` remains on GitHub; local `archive/…` branches keep
  old commits.
