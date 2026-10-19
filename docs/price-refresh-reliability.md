---
type: decision
updated: 2026-10-19
status: current
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
- [x] Run tests, ESLint and Wrangler's dry-run build.
- [x] Deploy the separate Worker, securely synchronize `CRON_SECRET` with the
  app and manual Actions workflow, then verify real scheduled invocations.
- [x] Remove GitHub's automatic schedule after the relay works; commit and push.
- [x] Observe a real scheduled batch refreshing quotes through the existing credit budget.

## Production verification — October 12, 15:42 UTC

The scheduler was already deployed, despite the unfinished checklist above.
Its deployed source matches the repository, its five-minute trigger is present,
and `CRON_SECRET` is configured. No credential rotation or redeployment was needed.
The scheduled invocation at 15:42:23 UTC completed successfully in 17 seconds,
with 0 ms reported CPU. It refreshed PLD, EQIX, O, SPG, QQQ, and SOXX.
The corresponding app request returned HTTP 200 with no logged exceptions.
The app request used 1,341 ms CPU; the lightweight relay avoids the scheduled
invocation limit but does not eliminate the app's own CPU-limit risk.

28 schedule, budget, API-parser, and relay tests pass, as do scoped ESLint and
Wrangler's dry-run build. GitHub's automatic trigger is removed; its manual
workflow remains available.

The job reserves at most six credits per minute and 600 per UTC day. A run every
five minutes therefore refreshes at most six quotes, not every tracked quote.
With 60 instruments, a quotes-only rotation takes about 50 minutes. Daily-close
updates and listing synchronization also consume the same allowance.

This verifies successful live batch updates, not that every stored quote is fresh.
The current local database credential reaches a database without the app tables,
so a complete production timestamp audit was unavailable. Production logs supplied
the evidence above. Historical Cloudflare log queries also require permissions
beyond the current OAuth token; live tails work.

## Noticing failures (2026-10-12)

Until now a failed run was visible only in Cloudflare's logs, which nobody
reads and the OAuth token can't query historically.

- `/api/cron/prices` records its outcome in `JobState`: `price-job` on
  success, `price-job-failed` on failure. That needed no schema change.
- `/api/cron/health` (needs `CRON_SECRET`) answers 200 when prices are as
  fresh as the schedule promises, and 503 with the problems when they aren't.
  The rules are in `src/lib/price-health.ts`:
  - No success in 30 minutes.
  - During market hours, a quote not refreshed for 150 minutes, counted from
    the open so the first rotation isn't flagged. The budget allows about
    100 minutes for 60 instruments.
  - Three hours after a session settles, any final quote or close check
    still missing.
- `.github/workflows/price-health.yml` calls it hourly. A failed scheduled
  workflow emails the repository owner, so a broken job reaches an inbox.
  GitHub's unreliable schedule (above) only delays the alert by hours. It
  doesn't hide an outage.

Rejected: having the scheduler Worker raise the alert, because its
failures land in the same unread logs; and a paid uptime monitor.

## Price job CPU (2026-10-16)

The app request behind each scheduled run used 650–1,341 ms of CPU, which
risks Cloudflare error 1102 as more stocks are saved. Profiling against the
dev database (60 instruments, 24,000 closes, 6,400 listings) found two reads
doing most of the work:

- `readTrackedStates` asked Prisma for each instrument's latest close as a
  nested `take: 1` relation: 230–500 ms. Two flat queries (instruments, then
  `max(date)` per ticker) take about 25 ms.
- `buildMarket` loaded a year of closes as Prisma rows with `Decimal`s, then
  grouped them in JavaScript: about 300 ms. Postgres now groups them per ticker
  with `json_agg` and casts to `float8`: about 100 ms for the whole build.

Both return identical output, checked by running the old and new code against
the same data. Computing and serializing the snapshot was never the cost; the
Prisma row mapping was. Each remaining query costs about 7 ms of CPU.
`rebuildDirectory` (about 150 ms) only runs when the symbol list or sectors
change, which is about once a day. Rejected: caching the snapshot between runs
(it changes whenever a quote does) and splitting the job into more requests
(each pays the bundle's start-up again).

A production before/after comparison wasn't possible on 2026-10-16: see the
next section.

**Production after (2026-10-19).** The scheduled runs at 10:37 and 10:42 UTC
used 364 and 370 ms of CPU, against 650–1,341 ms before. Each refreshed prices
within the normal credit budget, after [[price-job-bind-limit-outage]] was
fixed.

## Scheduler Worker missing (2026-10-16)

Restoration on October 17 is recorded in [[price-scheduler-restoration]];
the missing-Worker diagnosis below is historical.

`wrangler tail gowatchlist-price-scheduler` failed with "This Worker does
not exist on your account", and the account's script list holds only
`gowatchlist`; the older `watchlist` Worker is gone too. An 11-minute tail of
`gowatchlist` saw no `/api/cron/prices` requests. GitHub's scheduled runs
stopped on 2026-10-12 when the scheduler replaced them, so nothing has been
triggering the price job. Redeploying needs `CRON_SECRET` on the scheduler,
and a Cloudflare secret can't be read back from the app Worker.

## References

- [GitHub schedule limitations](https://docs.github.com/en/actions/how-tos/troubleshoot-workflows)
- [Cloudflare scheduled handlers](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
