---
type: troubleshooting
updated: 2026-10-19
status: current
---

# Price job bind-limit outage (2026-10-18)

Related: [[price-scheduler-restoration]], [[price-refresh-reliability]], [[cloudflare-workers-deploy]], [[postgres-prices]]

## Symptom

The price job had no success from 2026-10-18 06:32 UTC until the fix on
2026-10-19. Every run returned 502 with
`WebSocket connection closed (1006 : WebSocket disconnected without sending Close frame.)`.
Nobody saw it for about 28 hours: the hourly health workflow wasn't
published yet, and over the weekend no quotes were due, so pages looked
normal. The health workflow's first run after it was published caught it:
"The price job last succeeded 1670 minutes ago."

## Cause

[[price-scheduler-restoration]] raised the symbol-list insert chunk
(`LISTING_CHUNK` in `src/lib/price-job.ts`) from 1,000 to 4,000 rows on
2026-10-17. A listing has five columns, so a chunk took 20,000 bind values.
`@prisma/adapter-ppg` allows 16,384 (`maxBindValues: 16 << 10`). Past that,
Prisma splits the `createMany` and wraps the pieces in a transaction. In
this driver, plain queries go over HTTP, but a transaction opens a
WebSocket session, which the deployed Worker loses.

It only appeared when the symbol sync was next due, 20 hours after the last
one. A failed sync never records `symbols` in `JobState`, so every run after
that retried it. Each retry spent one Twelve Data credit on the stock list,
then failed before fetching any closes or quotes.

## Fix

`LISTING_CHUNK` is 3,200 (16,000 bind values), so each chunk is one
statement. About 6,400 listings still take two inserts, so the subrequest
budget is unchanged. `tests/price-job-subrequests.test.mjs` now fails
whenever a listing chunk would exceed 16,384 bind values; it failed against
the 4,000-row chunk before the fix.

Rejected: keeping 4,000 rows and running the insert as raw SQL with JSON
parameters, as `syncCiks` does. That would work, but a smaller chunk fixes
it with one constant.

## Lesson

With this driver, no single write may exceed 16,384 bind values, or it
becomes a transaction. Count columns × rows before raising a batch size.
