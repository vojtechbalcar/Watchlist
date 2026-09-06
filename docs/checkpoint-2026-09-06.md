---
type: checkpoint
updated: 2026-09-06
status: current
---

# Checkpoint — 2026-09-06

## Working

All four routes use the restored screenshot style: Dashboard, Watchlist, Compare, and Explore. The user approved Dashboard and Watchlist, then requested structural redesigns for Compare and Explore after rejecting a color-only change. Those layouts are now rebuilt; see [[neutral-page-design]].

Dashboard ranges, watchlist search/filter/sort controls, Compare range/selection controls, and Explore sector/search/filter/membership controls are wired. The redesign is committed as `a67a2e9`.

Verification completed during the redesign:

- Production build, TypeScript, and ESLint passed.
- All four routes were checked at 1440px and 390px widths: no horizontal page overflow or browser runtime errors after the table-scroll fix.
- Browser interaction checks passed for Explore sector filtering, performance filtering, search, empty results, and membership toggling; Compare range/chart updates, removal, re-addition, and minimum selection also passed.
- Typecheck, lint, and diff-whitespace checks passed again immediately before the redesign commit.

## Limitations

All market data and chart histories are demos. Watchlist removal and Explore membership are local component state and are neither persisted nor synchronized across routes. Compare supports the three stocks with demo return data and a fixed S&P 500 benchmark. Some legacy Figma components/data fields remain in the repository but are not used by the current pages.

The original startup error was missing dependencies: `node_modules` did not exist. `npm ci` restored the locked dependencies. The dev server also reports an unrelated parent-directory lockfile warning. The final browser checks used the existing server on port 3000.

## Next

Follow [[git-commit-workflow]] for each subsequent change. The user has not requested a new application feature yet. Future data work must read prices from Postgres; only the cron job may call the stock API, per [[CLAUDE-hard-rules]]. Replace illustrative series and local membership when that work is authorized; see [[watchlist-placeholder-data]].
