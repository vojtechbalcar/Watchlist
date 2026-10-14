---
type: decision
updated: 2026-10-14
status: current
---

# Saved stock price refresh

Related: [[price-refresh-reliability]], [[saved-watchlist]], [[postgres-prices]], [[watchlist-comparisons]]

The saved-watchlist endpoint refreshed untracked listings on every stale read. That violated the provider boundary in `AGENTS.md` and meant saved stocks depended on someone opening the watchlist.

The scheduled job now reads saved account ticker lists, validates and deduplicates them, excludes tracked instruments, and schedules only existing matching listings. Tracked and saved stocks share one oldest-first queue and the existing six-per-minute/600-per-day job credit allowance. Reserve close credits before separating backfills from top-ups so grouping cannot change priority. Listing top-ups merge into stored history (up to 400 sessions), omit unfinished daily bars, and preserve history on an empty provider response. A completed empty lookup is marked checked to avoid spending the next run on the same rejected symbol.

`getWatchlistListings` is read-only. Explicit live search and an untracked stock's detail page retain their authorized on-demand refreshes. Logos remain on-demand. No schema migration or Instrument promotion is needed.

Rejected: continuing refresh-on-watchlist-read, assigning saved stocks a separate credit allowance, or promoting every saved listing into the curated instrument catalogue.

## Verification

Regression tests reproduce the previous provider calls and missing scheduled updates, then verify stored-only reads, shared six-credit rotation, history preservation, settled bars, and exclusion of unsaved/invalid symbols. All 171 Node tests, TypeScript, scoped ESLint, and the diff whitespace check pass. Production confirmation still requires deployment of this commit and observing its scheduled run.
