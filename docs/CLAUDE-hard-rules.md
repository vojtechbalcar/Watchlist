---
type: decision
updated: 2026-10-06
status: current
---

# Hard rules

Related: [[postgres-prices]], [[stock-search-and-price-schedule]]

- Client components read price data from Postgres only, through the server. Only the scheduled price job and on-demand lookups (`/api/stocks/quotes?live=1`, an untracked stock's page, and `/api/stocks/watchlist`) call the stock API, all through `src/lib/twelve-data.ts` and the shared credit budget. Until 2026-10-01 the rule was "only the cron job calls the stock API". The user relaxed it so search can show live prices for stocks outside the tracked set; see [[stock-search-and-price-schedule]]. On 2026-10-06 watchlist rows for untracked stocks joined the on-demand lookups.
- Maroon is brand only, never gains or losses. Green/red are market direction only.
- The word is "watchlist", never "portfolio".
