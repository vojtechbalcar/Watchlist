---
type: decision
updated: 2026-10-12
status: in-progress
---

# Price refresh reliability

Related: [[cloudflare-workers-deploy]], [[stock-search-and-price-schedule]], [[postgres-prices]]

## Evidence

GitHub launched only 4–5 scheduled price jobs per full day on October 8–11,
despite `*/5 * * * *`. The runs started promptly once created and finished
within seconds; concurrency was not holding a long-running job. Three runs
failed, including Cloudflare error 1102 (CPU limit). On October 12, 50 of 60
tracked quotes were still from October 6, although daily closes had caught
up to October 9. The old checkpoint's missing-key explanation is obsolete:
all four runtime secrets exist and authenticated jobs successfully fetch data.

## Decision

Use a separate, dependency-free `gowatchlist-price-scheduler` Worker. Its
five-minute Cron Trigger makes an authenticated HTTP request to the app's
existing `/api/cron/prices`. The app retains all database writes and Twelve
Data calls, including the shared credit budget. The scheduler has only
`CRON_SECRET`, no database or market-data credentials, and no public route.
It runs at minutes 2, 7, 12, etc. Each request has a one-minute timeout; a
network failure or HTTP 5xx gets one retry. Invalid credentials fail at once.
Failed invocations remain failures in Cloudflare logs. The next scheduled
run catches up from stored timestamps.

Rejected: continuing GitHub's unreliable schedule; restoring the cron
handler inside the full Next.js bundle (previously killed at 10 ms CPU);
upgrading the Cloudflare plan (the user chose to stay on Free). GitHub's
workflow remains available for manual recovery only after the new scheduler
has been verified in production. The app's HTTP requests can still hit its
own CPU limit; the relay does not increase that limit.

## Implementation and verification plan

- [x] Reproduce missed triggers using GitHub run timestamps and stored quote ages.
- [x] Add scheduler tests for authentication, transient errors, retry limits,
  invalid reports, and missing secrets; implement the minimal relay.
- [ ] Run tests, ESLint and Wrangler's dry-run build.
- [ ] Deploy the separate Worker, securely synchronize `CRON_SECRET` with the
  app and manual Actions workflow, then verify real scheduled invocations.
- [ ] Remove GitHub's automatic schedule after the relay works; commit and push.
- [ ] Verify that overdue quotes catch up without bypassing the credit budget.

## References

- [GitHub schedule limitations](https://docs.github.com/en/actions/how-tos/troubleshoot-workflows)
- [Cloudflare scheduled handlers](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
