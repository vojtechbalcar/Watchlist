---
type: decision
updated: 2026-09-18
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
