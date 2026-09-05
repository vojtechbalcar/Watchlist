---
name: watchlist-placeholder-data
description: All dashboard numbers come from src/lib/watchlist-data.ts, the single seam to replace when Postgres lands — no component reads a data source.
metadata:
  type: project
---

Every price, percentage and series on the dashboard is placeholder data in
`src/lib/watchlist-data.ts`. Nothing touches a data source yet.

It is deliberately the *only* seam: components take typed props
(`Holding`, `OverviewSummary`, `MarketIndex`), so wiring Postgres means
replacing that module's exports and changing no component.

Still hardcoded and needing real data when the schema exists:

- Ranged series for the overview chart — the `d` attributes in
  `performance-chart.tsx` must be generated from price history.
- Per-holding intraday series behind `sparkline.tsx`.
- The range selector (1D/1W/1M/YTD/1Y) renders and highlights but does not
  refetch; `summary.range` is static.
- Company logos exist only for AAPL and NVDA (`public/logos/`). Everything
  else falls back to a two-letter monogram on the black tile.

Per [[CLAUDE-hard-rules]], when this is wired the reads go to Postgres only —
the cron job stays the sole caller of the stock API.

See [[design-tokens-from-figma]] for where the visual values came from.
