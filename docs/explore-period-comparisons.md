---
type: decision
updated: 2026-09-14
status: current
---

# Explore period comparisons

Related: [[explore-sector-pages]], [[settings-preferences]], [[watchlist-placeholder-data]], [[git-commit-workflow]]

The user requested stock cards grouped into market sections, showing the snapshot price and comparison with each stock's benchmark for a selected timeframe. The sector cards and separate category pages from `d84cbf2` remain the layout. Sector tabs and the interrupted local card design were not carried over.

Explore and its category pages now offer 1D, 1W, 1M, YTD, and 1Y. The initial period uses the browser's comparison preference. A provider in Explore's nested layout preserves an explicit selection across “Show all” and “All sectors” navigation without overwriting the saved default or requiring dynamic server rendering.

Each card displays stock return, sector benchmark return, and their difference in percentage points for the selected period. Prices and today's move remain the latest illustrative snapshot. Filters and benchmark/return sorting use the selected period. Equal returns are neutral, excluded from both Ahead and Behind filters; missing returns show unavailable data.

All 48 demo stocks have explicit fixtures for the longer periods. Each sector shares one benchmark return for a given period. Gaps are calculated from those returns, replacing the old inconsistent per-stock daily gap fixtures as the displayed source. These are illustrative values, never fetched quotes or historical market data. No API calls were added. Rejected: relabeling the existing daily gap as another timeframe, multiplying daily returns to invent history, or overwriting the newer sector-page design with the incomplete draft.

## Pull recovery

`git pull` was blocked because the interrupted local Explore draft touched the same files as the newer remote redesign. The six draft files were saved together in the named stash `explore-local-draft-before-sync-2026-09-14`, including the two untracked source files. The working branch then fast-forwarded from `968f7d8` to `d84cbf2`. Only the unfinished period-comparison behavior was carried into the newer design; the original stash remains recoverable. Unrelated untracked directories were untouched.

Do not apply the entire draft stash over the current design: it imports a CSS file that was never created and predates category pages.

## Verification

`pnpm typecheck`, ESLint on affected code, nine Node tests, and `pnpm build --webpack` passed. The build preserves static Explore pages and all nine generated category routes. Browser checks covered 36 preview cards, the saved comparison default, selected-period arithmetic, unchanged snapshot prices, period continuity across category links, category-scoped search, performance filters and sorting, membership toggles, neutral zero gaps, mobile width, keyboard period selection, and unknown-sector 404s. No page errors occurred; desktop and mobile screenshots were inspected.

Use the development server's advertised `localhost` URL. Testing against `127.0.0.1` triggered Next.js development-origin restrictions and prevented hydration, making native form controls appear to change without saving. The settings form now waits for hydration before allowing edits.
