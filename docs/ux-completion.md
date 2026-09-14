---
type: decision
updated: 2026-09-14
status: in-progress
---

# UX completion

Related: [[ux-completion-plan]], [[neutral-page-design]], [[watchlist-placeholder-data]], [[settings-preferences]], [[git-commit-workflow]]

The user approved loading, recovery, shared watchlist membership, empty states, action feedback, chart improvements, and mobile/accessibility checks. They also requested a separate branch for each and autonomous Git management. The seven feature branches are integrated on `feat/ux-completion`, preserving the newer Explore period controls from GitHub.

Selections will persist in this browser; market data remains illustrative. Reject per-page membership and fake loading delays. The current data boundary remains Postgres-only for eventual price reads, with only cron allowed to call a stock API.

See [[ux-completion-plan]] for the approved scope, implementation decisions, branch order, and verification requirements.

## Loading states

Market navigation now lives in the persistent layout. Dashboard, Watchlist, Compare, Explore/category, and Settings have route-specific skeletons. Pending links announce progress without layout shift or artificial delay, and animation respects both reduced-motion preferences. TypeScript, ESLint, nine Node tests, production build, and four desktop/mobile navigation tests passed.
