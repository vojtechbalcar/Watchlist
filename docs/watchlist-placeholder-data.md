---
name: watchlist-placeholder-data
description: Current demo data sources and the boundaries to replace when Postgres and persisted watchlists are implemented.
type: project
updated: 2026-09-11
---

# Watchlist placeholder data

All market values and plotted histories are illustrative. No component currently reads a live price source. See [[neutral-page-design]] and [[checkpoint-2026-09-06]] for the current UI.

## Data sources

- `src/lib/watchlist-data.ts` supplies dashboard indices, overview summary, and the seven-stock watchlist.
- `src/lib/compare-data.ts` supplies per-range demo returns for NVDA, MSFT, AMZN, and the fixed S&P 500 benchmark. The comparison matrix is derived from those returns; differences are percentage points.
- `src/lib/explore-data.ts` supplies 48 demo stocks, nine sectors, and the sector-to-index map. The larger fixture set supports the previews and dedicated category pages in [[explore-sector-pages]].

These fixtures are not a unified market snapshot. Prices, daily returns, or benchmarks may differ between fixtures. Do not present them as synchronized live market data.

## Charts and interactions

Dashboard history is now in `overview-card.tsx`. Its 1M/3M/6M/YTD controls select and rebase illustrative samples. Compare history is generated in `compare-chart.tsx` from an illustrative shape normalized to each range's demo return; switching ranges updates both metrics and geometry. Neither chart is sourced from dated price history.

Old Figma paths and legacy chart components remain in the repository but are not the currently rendered dashboard or comparison histories.

Watchlist removal and Explore membership are local component state. They reset on remount and do not synchronize across routes. Add links navigate to Explore; they do not imply database persistence.

Company logos use available local assets and the shared `stock-logo.tsx` fallback. The old claim that only AAPL and NVDA have logos is obsolete.

## Future integration boundary

Per [[CLAUDE-hard-rules]], price reads must come from Postgres and only the cron job may call the stock API. Integration must replace the fixtures and component-level illustrative histories, establish consistent timestamps/ranges, and persist watchlist membership when authorized. Merely replacing the exports of `watchlist-data.ts` will not connect every current page.
