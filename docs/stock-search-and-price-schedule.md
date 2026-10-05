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
  scheduled job and `/api/search` (now `/api/stocks/quotes`), both through `src/lib/twelve-data.ts` and
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
- `/api/stocks` (`src/lib/stock-directory.ts`) and `/api/stocks/quotes`
  (`src/lib/stock-quotes.ts`), both signed-in only; see "Faster search" below.
- `src/components/stock-search.tsx`: the combobox on Explore and the sector
  pages. Search no longer filters the cards.

## Pages for untracked stocks (2026-10-01)

The user pointed out that untracked rows in the dropdown did nothing when
clicked. Every row now opens `/explore/stocks/[ticker]`. A tracked ticker gets
the existing detail page. Any other listed ticker gets `ListingDetailView`:
- the live price, through the same 15-minute cache as search;
- the logo;
- returns for 1D/1W/1M/YTD/1Y against the S&P 500 (SPY). Untracked stocks
  have no sector, so the whole market is their benchmark.

The stock's year of daily closes is cached as JSON on its `Listing` row
(`closes`, `closesFetchedAt`) and refetched once per settled session, so the
first view costs up to 3 credits and later views nothing. A separate closes
table for untracked stocks was rejected; nothing queries those closes except
that one page. Returns come from `src/lib/period-returns.ts`, which the
tracked pages can use once they move off the demo data. The S&P column fills
in once the price job has stored SPY's closes.

`src/lib/listing-refresh.ts` holds the on-demand refreshes for both search and
this page. All of them spend the "search" budget (8 a minute, 800 a day), which
now covers every on-demand lookup.

Not there yet: an "Add to watchlist" button, because the watchlist still
only knows the 48 tracked stocks.

**Chart (2026-10-05).** The page now has the tracked page's panel: range
buttons, the three figures, a verdict, and a line chart of the stock against
the S&P 500 with the gap shaded green or red. The lines come from the same
cached closes as the table (`returnSeries`, both ending at the stock's latest
close), so the page spends no extra credits. The chart is
`ReturnLinesChart`, shared with the dashboard overview. Rejected: the tracked
page's bar chart of period totals, because the closes are already there to
draw the real path.

## Faster search and full sector lists (2026-10-01)

The user asked for two things. "Show all" on a sector only listed the demo
cards, and search felt slow: every keystroke waited on a server round trip
(about 1.5 s measured locally).

**Search now matches in the browser.** `/api/stocks` sends the whole directory
once: about 6,400 rows of `[symbol, name, exchange, sector, tracked]`, with
exchange and sector as indexes. That is 285 KB raw, 75 KB gzipped, and cached
privately for an hour. `rankCandidates` runs on every keystroke in about
3 ms. Only the visible six results go to `/api/stocks/quotes?live=1`, 200 ms
after typing pauses, and the browser reuses those answers for a minute. Rows
show a loading bar until their price arrives.
Rejected: a Postgres trigram index. It would still cost a round trip per
keystroke.

**Sectors come from the SEC.** Twelve Data's free plan has no sector data
(its profile endpoint costs extra credits per stock). EDGAR is free:
`company_tickers_exchange.json` maps tickers to company numbers (CIKs). That
covers 5,775 of the 6,392 listings, or 5,505 companies. Each company's
submissions file has its industry code (SIC), which `src/lib/sec-sectors.ts`
maps onto the app's nine sectors by code range. The mapping was checked
against the 48 hand-sectored stocks; only Visa (business services) and
Qualcomm (communications equipment) would differ, and tracked stocks keep
their own sector anyway.
- Mining and chemicals fall under Industrials and telecom under Technology,
  because the app has no Materials or Communication sector.
- SPACs and shells (SIC 6770, 9995+) get no sector.

The price job runs `syncCiks` daily and classifies 40 companies per run, both
before the Twelve Data key check because they cost no credits. A full
backfill was run locally on 2026-10-01.
Bulk updates pass rows as JSON through `jsonb_to_recordset`, because the
Prisma Postgres driver sends JS arrays as comma-joined text, which Postgres
rejects as `malformed array literal`. `UNNEST($1::text[])` failed that way
first.

**The directory is stored pre-built.** Assembling it took 6.3 s per request in
local workerd. The `Snapshot` table now holds the finished JSON. The price job
rebuilds it after the symbol sync, a CIK sync, or any sector batch, and
`/api/stocks` serves the stored text with an ETag (304 when unchanged). That
brought it to about 1.1 s locally, which is mostly the round trip to the US
database.

**Prefetch is off for stock links in search and sector lists.** Next.js
prefetches links as they scroll into view, and prefetching an untracked
stock's page renders it, which spends up to 3 credits. The local Worker log
showed the sector list doing that for every visible row before
`prefetch={false}`. Any future link to an untracked stock's page needs the
same.

**Sector pages list every stock.** `SectorStockList` sits under the tracked
cards, 30 at a time with "Show more". Its prices are stored-only
(`/api/stocks/quotes` without `live`); pricing 700 stocks a sector would
take 90 minutes of the free plan's per-minute budget. A stock gets a price
once someone searches or opens it.

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

## Market holidays (2026-10-02)

`marketHours` in `src/lib/price-schedule.ts` knows the NYSE calendar: the ten
full holidays (weekend dates moved to Friday or Monday; New Year's Day on a
Saturday is not observed) and the 13:00 early closes on July 3, the day after
Thanksgiving, and Christmas Eve. `isMarketOpen` and `latestSettledSession` use
it, so the job spends no quote credits on a holiday and doesn't wait for a
session that never happens. The dates are computed by rule, including Good
Friday from Easter. Rejected: a hardcoded list of dates, which runs out, and
Twelve Data's `/market_state`, which costs a credit per check.

Not modelled: unscheduled closures such as a national day of mourning. On
one, the job behaves as it used to on every holiday: it fetches quotes that
haven't moved.
