---
type: decision
updated: 2026-09-21
status: current
---

# Postgres-backed prices

Related: [[watchlist-placeholder-data]], [[CLAUDE-hard-rules]], [[loading-states]], [[saved-watchlist]], [[git-commit-workflow]]

Real accounts and market data is three sub-projects, not one: prices in
Postgres, authentication, and account-saved watchlists. The user chose to build
prices first. It depends on neither of the others, it satisfies the standing
rule that price data comes from Postgres and only the cron job calls the stock
API, and the Suspense boundaries from [[loading-states]] are already shaped to
carry the reads. Authentication comes next, as Auth.js credentials against this
same database; account-saved watchlists last, since it needs both.

## Design

`src/lib/watchlist-data.ts` has always been the single seam to replace, and
this replaces it. Company identity — ticker, name, sector, currency, logo —
moves from `explore-data.ts` into a `Stock` table, seeded from the existing
catalog, because it is reference data the API does not need to supply. Prices
become two tables: `DailyClose`, one row per ticker per trading day, and
`Quote`, the latest price and day change per ticker. Every range the app
offers — 1D, 1W, 1M, YTD, 1Y — is a lookup of two closes, and the dashboard
chart is a series of them, so daily closes plus a latest quote covers every
current view with one cron run per day. Benchmarks are stocks too: an index or
ETF row the same tables describe, which is what lets a stock's return be
compared with its sector benchmark without a second code path.

Prisma defines the schema and applies migrations. The user chose it over plain
SQL for the typed client across the data layer, accepting the extra dependency
and its generate step.

One route, `/api/cron/prices`, is the only code that calls the stock API. It
authenticates with `CRON_SECRET` and rejects anything without it, so the
schedule is the only caller in practice as well as in principle. Twelve Data is
the provider: its free Basic plan allows 8 credits a minute and 800 a day over
real-time US equities and ETFs, which covers the catalog's tickers and their
benchmarks on a daily run with room to spare, and it supports batch requests.
The provider call lives behind one module so a change of provider is a change
of one file.

A ticker the database has no prices for shows an honest gap: figures render as
— and the surface says the data is not in yet, the way Explore already handles
a stock with no performance for a range. The demo snapshot is not kept as a
fallback, because a user cannot tell a fallback from a real price.

Rejected: keeping the illustrative data as a fallback, which presents invented
numbers as real; hiding unpriced stocks, which would make a saved stock vanish
without explanation; intraday bars, which multiply the data and the API quota
for a view the app does not yet offer; and calling the stock API from a page or
a client component, which the project's hard rules forbid outright.

## Blocked on

- `vercel login`, before the database can be provisioned through the Vercel
  Marketplace. `vercel integration discover` starts a device-login flow and
  hangs without it.
- A Twelve Data account and its API key in `.env.local`, before the cron job
  can fetch anything.

## Implementation plan

- [ ] Provision Postgres via `vercel integration discover --category storage`
      and `vercel integration add`, then `vercel env pull`. Requires the login
      above.
- [ ] Add Prisma, `prisma/schema.prisma` with `Stock`, `DailyClose`, and
      `Quote`, and the first migration. Seed `Stock` from the existing catalog
      in `explore-data.ts`.
- [ ] Add failing tests for return calculations over stored closes, including
      missing days, a ticker with no closes at all, and a range that predates a
      ticker's first close.
- [ ] Replace the reads: `watchlist-data.ts`, `watchlist-catalog.ts`,
      `explore-performance.ts`, and `market-benchmark.ts` query Postgres through
      one data-access module. Pages become async server components inside the
      Suspense boundaries that already exist.
- [ ] Render honest gaps wherever a figure is missing, matching Explore's
      existing "no data for this range" treatment.
- [ ] Add `/api/cron/prices` with `CRON_SECRET`, the Twelve Data fetcher behind
      its own module, and the schedule in `vercel.json`.
- [ ] Verify: tests, typecheck, scoped ESLint, a real cron run populating the
      tables, every route against real rows, and every route against an empty
      database. Update the docs, review the diff, commit and push.

## Verification

Pending.
