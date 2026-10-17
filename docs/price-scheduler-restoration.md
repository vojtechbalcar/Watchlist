---
type: decision
updated: 2026-10-17
status: current
---

# Price scheduler restoration

Related: [[price-refresh-reliability]], [[cloudflare-workers-deploy]], [[stock-search-and-price-schedule]], [[checkpoint-2026-10-16]]

## Diagnosis

The scheduler was recreated at 10:34 UTC on October 17, with the expected
five-minute trigger, but had no secret bindings. GitHub's manual recovery
workflow also returned Unauthorized, showing its saved secret no longer
matched the app.

After authentication was repaired, the price job failed with **Too many
subrequests by single Worker invocation**. Sector classification could spend
40 HTTP requests before the price work, on top of database calls made over
HTTP. The existing error handler could not recover an exhausted invocation.

## Fix

- Generated a new secret and updated `CRON_SECRET` on the app Worker,
  scheduler Worker, and GitHub repository without printing the value.
- Deployed the existing lightweight scheduler with `2-59/5 * * * *`.
- Reduced SEC classification to four companies per run and increased listing
  insertion chunks to 4,000 rows. The shared six-credit price budget stays
  unchanged. Classification progresses more slowly; price refreshes have room.
- The hourly Price health workflow exists in local commit `c78d6d1`, but
  GitHub rejected publishing it because the saved OAuth login lacks the
  `workflow` scope. The runtime fix is published separately; the monitoring
  workflow remains local until a credential with that scope is available.

Rejected: increasing paid limits, bypassing the price credit budget, or
ignoring an authenticated job's failure because the scheduler itself exists.

## Autonomy correction

The assistant previously described secret restoration as requiring the user.
The existing Cloudflare OAuth login and GitHub access permit rotating all
copies, so an unreadable old secret is not a blocker and does not require
asking the user to retrieve it.

## Verification

A regression test simulates a 6,400-listing metadata backlog and 60 stale
instruments. It failed at the HTTP request limit before the fix and passes
with room left for outcome recording. The full 184-test suite, TypeScript,
scoped ESLint, Next.js production build, and OpenNext bundle build pass.

The scheduler deployment is `b1db6971-46c4-4520-8d0c-d6088dbf4c85` and the
fixed app deployment is `bbb90eae-bc2b-498e-b5c1-b24652cd6a4f`.

The [manual recovery run](https://github.com/vojtechbalcar/Watchlist/actions/runs/39025858495)
succeeded at 10:41 UTC, updating closes for COP, SLB, EOG, CAT, BA, and HON.
The app returned HTTP 200 without exceptions. The authenticated health check
records the new success and shows 49 missing close checks, down from 55,
proving that the job persisted data. All 60 quotes are still overdue: the
normal budget catches up closes before rotating through final quotes.

Automatic timer verification is still pending at this point; successful
manual recovery alone does not verify the trigger.
