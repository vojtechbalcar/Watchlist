---
type: decision
updated: 2026-10-01
status: current
---

# Hard rules

Related: [[postgres-prices]], [[stock-search-and-price-schedule]]

- Pages and client components read price data from Postgres only. Only the scheduled price job and `/api/search` call the stock API, both through `src/lib/twelve-data.ts` and the shared credit budget. Until 2026-10-01 the rule was "only the cron job calls the stock API". The user relaxed it so search can show live prices for stocks outside the tracked set; see [[stock-search-and-price-schedule]].
- Maroon is brand only, never gains or losses. Green/red are market direction only.
- The word is "watchlist", never "portfolio".
