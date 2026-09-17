---
type: decision
updated: 2026-09-17
status: in-progress
---

# Error screens

Related: [[neutral-page-design]], [[account-pages]], [[git-commit-workflow]]

The user requested custom error screens on a separate branch, with each major verified change committed and pushed. Work is on `feat/error-screens`; existing setup and watchlist drafts are outside these commits.

## Design and implementation plan

Use the existing neutral surfaces, local Helvetica Neue, thin rules, and ink actions. Maroon remains a brand/focus color; market direction colors do not identify application errors. Recovery screens have a simple wordmark header, one main heading, short explanatory copy, and clearly labeled recovery actions.

- [x] Add a shared `RecoveryScreen` and root `not-found.tsx`. Both unknown URLs and unknown Explore sectors offer Dashboard, Explore, and Watchlist links.
- [ ] Add root `error.tsx` with Next.js 16.3's `retry()` callback, plus `global-error.tsx` with its own document, font, and styles for root-layout failures.
- [ ] Verify real error recovery and the independent global fallback; commit and push the second change.

The shared screen does not read market data, preferences, or watchlist storage. Its recovery navigation uses plain links for a fresh navigation, including when router state is unavailable; the 404's primary Dashboard link uses normal Next.js navigation. CSS token fallbacks allow the global error document to render without the failed root layout's stylesheet. Do not expose exception messages or stacks in the UI.

Rejected: an experimental global 404 route when the existing single root layout supports `not-found.tsx`; red error decoration that borrows market-direction colors; full market navigation dependent on app state; and a permanent public route for intentionally throwing errors.

## Verification

Before implementation, the browser check received a 404 but failed to find the custom heading, confirming the existing default screen. Baseline typecheck, scoped lint, and all 13 existing data-helper tests passed.

The 404 change passes typecheck, scoped ESLint, and diff-whitespace checks. Chromium verified the custom heading and title, a single main landmark, 404 responses for unknown root and sector URLs, working Explore navigation, and no horizontal overflow at 1440, 390, and 320 pixels. The mobile screenshot was inspected. Browser launches require execution outside the sandbox; the existing cached Playwright/Chromium installation was used without adding project dependencies.
