---
type: decision
updated: 2026-10-01
status: current
---

# Stock search and the price schedule

Related: [[postgres-prices]], [[CLAUDE-hard-rules]], [[cloudflare-workers-deploy]], [[explore-sector-pages]], [[explore-stock-details]]

The user wants every stock Twelve Data lists to be findable, while only the
stocks the app shows are kept up to date on a schedule. Searching on Explore no
longer filters the cards: a dropdown under the search bar lists matching
stocks with logo, ticker, name, and current price. Any stock outside the
tracked set gets its price at the moment it is searched.

## Decisions

- **Hard rule changed.** It was "Price data comes from Postgres only. Only the
  cron job calls the stock API." The user chose to let search fetch live
  prices, with caching. Two server routes may now call Twelve Data: the
  scheduled job and `/api/search`, both through `src/lib/twelve-data.ts` and
  the shared credit budget. Pages and client components still read prices
  from Postgres only.
- **Search prices are cached in Postgres for 15 minutes.** A repeat search
  reuses the stored price instead of spending credits. Rejected: a fresh call
  on every search, which a busy minute would push past the free plan's
  8 credits a minute.
- **Logos are fetched once and cached.** The first search for a stock asks
  `/logo` for its URL and stores it. Prices take priority over logos when
  credits are short; a stock without a logo yet shows the generic building
  icon and gets one on a later search. Rejected: letter marks only.
- **"All stocks" means NASDAQ and NYSE common stock, ADRs, and REITs.** That is
  about 6,400 symbols. Twelve Data's US list is 20,000 entries, but 12,800 of
  them are OTC, and the rest of what's excluded is warrants, preferred shares,
  and units. The list is synced daily for 1 credit.
- **Twelve Data stays the provider.** The free Basic plan allows 8 credits a
  minute and 800 a day. Quotes, daily series, and logos each cost 1 credit per
  symbol, so a batch request saves round trips but not credits.

## Credit budget

One ledger, `ApiUsage`, counts credits per UTC minute and per UTC day for every
caller. A call reserves credits before it goes out and skips when the
reservation would cross its limit:

| Caller | Per minute | Per day |
|---|---|---|
| Scheduled job | 6 | 600 |
| Search | 8 (whatever the job left) | 800 |

The job runs every 5 minutes on a Cloudflare Cron Trigger. Each run spends at
most 6 credits, in this order:

1. The symbol list, when the last sync is over 20 hours old (1 credit).
2. Daily closes for tracked instruments that miss the latest finished session
   (backfilling about 400 sessions the first time, so 1Y and YTD work).
3. Quotes for tracked instruments, oldest first. During market hours a quote
   is refreshed once it is 50 minutes old. After the close, each instrument
   gets one final refresh.

That is about 570 credits on a trading day for the 58 tracked instruments,
which leaves over 200 for search.

## How it fits together

- `src/lib/twelve-data.ts`: the only caller of the API, with pure parsers.
- `src/lib/api-budget.ts`: the `ApiUsage` ledger and per-caller limits.
- `src/lib/price-schedule.ts`: market clock (New York time, EDT/EST) and what is due.
- `src/lib/price-job.ts`, behind `/api/cron/prices` (`CRON_SECRET` bearer).
- `custom-worker.ts`: wraps `.open-next/worker.js` and adds `scheduled()`,
  which calls the route. `wrangler.jsonc` points `main` at it and sets the
  `*/5 * * * *` trigger. The pattern follows OpenNext's custom-worker how-to.
- `src/lib/stock-search.ts`, behind `/api/search?q=` (signed-in only, since a
  search can spend credits), ranked by `src/lib/search-ranking.ts`.
- `src/components/stock-search.tsx`: the combobox on Explore and the sector
  pages. Search no longer filters the cards.

## Setup the Worker needs

Secrets on the **gowatchlist** Worker (see [[cloudflare-workers-deploy]] for
why the name matters): `TWELVE_DATA_API_KEY` (a free key from twelvedata.com)
and `CRON_SECRET` (any long random string). Without the key the job fails
every run with `TWELVE_DATA_API_KEY is not set`, and search shows tracked
stocks' stored prices only.

## Verification (2026-10-01)

- 62 unit tests: parsers against real response shapes, budget arithmetic,
  the market clock across EDT and EST, due-lists, and ranking.
- The symbol sync ran against the real database: 6,392 listings in about 17
  seconds, and all 48 tracked stocks are among them.
- Local workerd: `/__scheduled` ran the Cron Trigger → custom worker → route →
  job chain. Both routes return 401 without credentials.
- Browser, desktop and 390px wide: the dropdown lists AAPL with its stored
  price; untracked matches show exchange and "—". Arrow keys and Enter open a
  tracked stock's page.
- Not verified: live batch prices and logos. The public demo key only serves
  single symbols, so those paths need the real key.

## Open

- Explore cards, the watchlist, and Compare still read the demo snapshot.
  Switching their reads to the stored quotes and closes is the next step from
  [[postgres-prices]].
- Untracked stocks in the dropdown have no detail page yet, so they aren't
  links.
- Market holidays aren't modelled. The job still refreshes quotes on a
  holiday, which wastes credits but doesn't break anything.
