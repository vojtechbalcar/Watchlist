---
type: decision
updated: 2026-09-18
status: current
---

# Saved watchlist

Related: [[settings-preferences]], [[watchlist-placeholder-data]], [[watchlist-comparisons]], [[git-commit-workflow]]

The user approved connecting Compare to their saved watchlist. The existing, uncommitted setup and membership integration is a prerequisite: the previously committed Explore and Watchlist views kept separate component state. These related draft files are verified and committed together before Compare adopts them. Unrelated assets, the nested scaffold, and the separate benchmark-spark edit are excluded.

Dashboard, Watchlist, and Explore now use `watchlist.stocks.v1` through one browser store. Additions and removals propagate across routes and tabs. Only ticker membership and setup flags are saved; prices and returns remain illustrative fixtures. No stock API calls or Postgres integration are introduced.

New visitors receive the existing three-step setup: sector interests, stock selection, and an explanation of the S&P 500 comparison. Skipping opens Explore; an empty watchlist offers setup or direct exploration. Completion and dismissal are stored separately from membership. Setup drafts do not yet survive a refresh.

The dashboard averages only selected stocks with equal weights and uses the same supported periods as Explore. Explore retains sector benchmarks; Watchlist and Dashboard use the S&P 500. Damaged storage recovers to an empty list, and blocked membership writes report a failure without pretending the change was saved.

Rejected: duplicating browser membership specifically for Compare, committing a Compare picker with no working way to save stocks, and including unrelated draft assets in this prerequisite.

## Verification

TypeScript, scoped ESLint, all 13 existing Node tests, and a production webpack build pass. Chromium verified setup with mouse and keyboard, reload persistence, Explore additions, Watchlist removals, cross-tab synchronization, dashboard membership, and a 390px mobile layout without page overflow or runtime errors. The production snapshot contains only staged project files.
