---
type: troubleshooting
updated: 2026-10-19
status: current
---

# Price job symbol-insert outage (2026-10-18)

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

[[price-scheduler-restoration]] raised the symbol-list insert chunk in
`src/lib/price-job.ts` from 1,000 to 4,000 rows on 2026-10-17, to save
subrequests. Prisma Postgres can't take a `createMany` that size, in two ways:

- **Over 16,384 bind values** (`maxBindValues: 16 << 10` in
  `@prisma/adapter-ppg`), Prisma splits the insert and wraps the pieces in a
  transaction. In this driver, plain queries go over HTTP, but a transaction
  opens a WebSocket session, which the deployed Worker loses. 4,000 rows × 5
  columns is 20,000. That gave the `WebSocket connection closed (1006 …)`
  error.
- **Past about 1,150 listings in one statement**, the server rejects the
  request with `error while decoding inbound frame`. Probing the dev database
  with `skipDuplicates` re-inserts of existing rows: 1,150 rows (about 131 KB
  as JSON) worked, 1,200 failed. 1,000-row chunks had stayed just under it.

It only appeared when the symbol sync was next due, 20 hours after the last
one. A failed sync never records `symbols` in `JobState`, so every run after
that retried it. Each retry spent one Twelve Data credit on the stock list,
then failed before fetching any closes or quotes.

## What didn't work first

Lowering the chunk to 3,200 rows (16,000 bind values) avoided the
transaction, but production then failed with `error while decoding inbound
frame`. That is the second limit above, found by probing the dev database
after reading the Worker's logs with `wrangler tail gowatchlist`.

## Fix

The whole list goes in as one statement with a single `jsonb` parameter, the
way `syncCiks` already sends thousands of rows:
`INSERT … SELECT … FROM jsonb_to_recordset(…) ON CONFLICT ("symbol") DO NOTHING`.
On the dev database, all 6,469 listings (736 KB) worked, and so did twice
that. It is also one subrequest instead of two. A new row with quotes and an
ampersand in its name inserted correctly and was deleted afterwards.
`tests/price-job-subrequests.test.mjs` fails if the symbol list goes through
`createMany` again.

The first production run after the fix, at 10:35 UTC on 2026-10-19,
returned HTTP 200 and synced 6,420 listings.

Rejected: going back to 1,000-row chunks, which sat just under the size
limit and cost seven subrequests.

## Lesson

With Prisma Postgres on Workers, keep big writes out of `createMany`: send
the rows as one JSON parameter to raw SQL. Bulk `createMany` either becomes
a transaction (over 16,384 bind values) or is rejected outright (past about
130 KB).
