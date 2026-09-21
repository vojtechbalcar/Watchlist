---
type: decision
updated: 2026-09-21
status: in-progress
---

# Watchlist comparisons

Related: [[saved-watchlist]], [[explore-period-comparisons]], [[compare-frame]], [[watchlist-placeholder-data]]

The user approved fixing Compare's separate three-stock dataset and selecting comparisons from their saved watchlist. Work is on `feat/watchlist-comparisons`, based on the completed error-screen branch.

## Plan

1. Verify and commit the existing saved-watchlist integration required by the comparison picker.
2. Make stock returns and S&P 500 differences agree across Watchlist, Dashboard, and Compare. Explore continues to compare the same stock returns with sector benchmarks. Update negative chart ranges and protect the arithmetic with regression tests.
3. Let users choose up to three saved stocks in the existing comparison layout, with stable series colors, an honest empty state, and cross-tab membership updates. Verify browser flows, build, commit, and push.

The three-stock limit keeps the existing chart and peer matrix readable; it limits simultaneous selections, not the stock universe. Market data remains illustrative, with future prices read from Postgres and stock API calls reserved for cron.

Rejected: copying the old Compare returns into Explore, pretending all sectors share the S&P 500, changing watchlist membership when removing a comparison, and plotting negative returns outside the chart bounds.

## Shared returns

The saved-watchlist prerequisite is committed as `e3f436a`. Compare now derives stock returns and S&P 500 gaps from `watchlist-catalog.ts`, which uses Explore's period fixtures. The broad-market benchmark lives in `market-benchmark.ts` to avoid a circular dependency. For example, MSFT YTD is +13.21%, or −1.39 pp against the S&P 500, everywhere it appears in the stock views. Explore still uses its labeled sector benchmark.

The comparison chart includes zero and negative returns in its domain; paths start at the same zero baseline and end at their actual period return. Curves remain illustrative, not historical price series. Missing or non-finite returns are omitted rather than replaced with zero. The landing page's Compare illustration also consumes the shared returns.

Regression coverage spans all 48 stocks and five periods, selection order/deduplication, peer arithmetic, and positive, negative, mixed, flat, and empty chart domains. The original tests failed on the separate Compare figures before the implementation changed. The saved-stock picker is the remaining step.

Verified this step with `pnpm typecheck`, scoped ESLint, and all 19 Node tests. Production browser verification follows with the picker.
