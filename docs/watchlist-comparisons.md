---
type: decision
updated: 2026-09-21
status: current
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

Regression coverage spans all 48 stocks and five periods, selection order/deduplication, peer arithmetic, and positive, negative, mixed, flat, and empty chart domains. The original tests failed on the separate Compare figures before the implementation changed.

Verified this step with `pnpm typecheck`, scoped ESLint, and all 19 Node tests. Production browser verification follows with the picker.

## Saved-stock selection

Compare starts with the first three saved stocks once browser storage is ready. The picker offers any remaining saved stock from the 48-stock catalog, with company names and an explicit three-stock limit. Comparison choices are local to the current visit; removing one leaves watchlist membership intact. Remaining selections retain their ink/taupe/slate color slots when another is removed or replaced, including when membership changes in another tab. A stock removed from the watchlist and subsequently re-added does not silently reappear in the current comparison.

An empty watchlist offers setup or exploration. Removing the last comparison leaves an actionable empty selection with the picker available. Unavailable period returns get a named explanation, while period controls remain usable. Zero differences use neutral text and are counted separately from stocks ahead or behind.

The comparison SVG observes its displayed width and positions labels in that coordinate space, avoiding compressed text on phones. Paths retain the same return endpoints after resizing. Rejected: shrinking a fixed 980-unit SVG with its labels, assigning every catalog stock a repeating color that collides within a selection, silently replacing removed choices, and adding another persistent store solely for comparison choices.

## Final verification

All 24 Node tests, TypeScript, scoped ESLint, and the production webpack build pass. Chromium verified setup and saved membership, the saved-only picker and three-stock limit, stable colors, all five periods, negative chart bounds, neutral peer gaps, keyboard removal with focus recovery, cross-tab removal/re-add/clear, empty selection and setup navigation, malformed and blocked storage, and the preferred comparison range. Desktop (1440px) and mobile (390px) screenshots were reviewed, including the corrected mobile SVG labels. No page overflow or browser runtime errors were observed. Builds used staged snapshots to exclude unrelated working-tree changes.
