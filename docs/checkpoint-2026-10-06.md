---
type: checkpoint
updated: 2026-10-06
status: current
---

# Checkpoint — 2026-10-06

Supersedes [[checkpoint-2026-09-06]].

## Working

- **Accounts**: email and password through Auth.js ([[account-pages]]). The
  watchlist and preferences are saved per account and follow the user across
  browsers. Offline changes are resent ([[account-watchlist]]).
- **Prices from Postgres** on every signed-in page ([[postgres-prices]]):
  58 tracked instruments refreshed by a 5-minute Cloudflare Cron Trigger.
  The schedule knows NYSE holidays and early closes
  ([[stock-search-and-price-schedule]]).
- **Any NASDAQ/NYSE stock** (about 6,400) can be searched, opened, charted
  against the S&P 500, added to the watchlist, compared, and picked in
  setup. Untracked stocks are priced when viewed, within the shared credit
  budget.
- **Charts** shade the gap to the market green where ahead and red where
  behind (dashboard and untracked stock pages).
- **Deploy**: Cloudflare Workers via OpenNext. `wrangler.jsonc` names the
  Worker `gowatchlist`, matching the live site ([[cloudflare-workers-deploy]]).
- 101 Node tests, typecheck, and ESLint pass.

## Broken or unverified

- **Production prices are frozen at 2026-10-01.** The `gowatchlist` Worker
  still needs the `TWELVE_DATA_API_KEY` and `CRON_SECRET` secrets; only
  the user can add them.
- **Never run against the real key:** batch quotes, logos, and on-demand
  refreshes for untracked stocks. Locally there is no key, so every check
  used stored prices.
- Migrations now run in the Cloudflare build (2026-10-07), but only once
  `DATABASE_URL` is added as a build variable on the Worker; until then the
  build warns and skips them ([[cloudflare-workers-deploy]]).

## Next

1. Once the secrets are set: watch a cron run succeed in the Worker logs,
   then check search, an untracked stock page, and an added stock refresh
   live.
2. Done 2026-10-07: migrations run in the build (needs the build variable).
3. Unscheduled market closures (e.g. a national day of mourning) aren't
   modelled. That is rare, and costs only wasted credits.
