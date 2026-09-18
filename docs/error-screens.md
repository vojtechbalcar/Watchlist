---
type: decision
updated: 2026-09-18
status: current
---

# Error screens

Related: [[neutral-page-design]], [[account-pages]], [[git-commit-workflow]]

The user requested custom error screens on a separate branch, with each major verified change committed and pushed. Work is on `feat/error-screens`; existing setup and watchlist drafts are outside these commits.

## Design and recovery behavior

Use the existing neutral surfaces, local Helvetica Neue, thin rules, and ink actions. Maroon remains a brand/focus color; market direction colors do not identify application errors. Recovery screens have a simple wordmark header, one main heading, short explanatory copy, and clearly labeled recovery actions.

- A shared `RecoveryScreen` and root `not-found.tsx` handle unknown URLs and unknown Explore sectors, offering Dashboard, Explore, and Watchlist links.
- Root `error.tsx` handles page and nested-layout rendering failures. “Try again” uses Next.js 16.3's `retry()` callback, which refetches the failed segment rather than only clearing its error state.
- `global-error.tsx` handles root-layout failures with its own HTML document, language, body margin reset, local font, and recovery stylesheet. The normal layout and global fallback share the font definition in `src/app/fonts.ts`.
- Runtime failures update the page title and focus the main heading for keyboard and screen-reader users. The next Tab reaches “Try again.” Controls retain visible focus rings; programmatic heading focus does not draw an interactive-control outline.

The shared screen does not read market data, preferences, or watchlist storage. Its recovery navigation uses plain links for a fresh navigation, including when router state is unavailable; the 404's primary Dashboard link uses normal Next.js navigation. CSS token fallbacks allow the global error document to render without the failed root layout's stylesheet. Do not expose exception messages or stacks in the UI.

Rejected: an experimental global 404 route when the existing single root layout supports `not-found.tsx`; red error decoration that borrows market-direction colors; full market navigation dependent on app state; and a permanent public route for intentionally throwing errors.

## Verification

Before implementation, the browser check received a 404 but failed to find the custom heading, confirming the existing default screen. Baseline typecheck, scoped lint, and all 13 existing data-helper tests passed.

The 404 change passes typecheck, scoped ESLint, and diff-whitespace checks. Chromium verified the custom heading and title, a single main landmark, 404 responses for unknown root and sector URLs, working Explore navigation, and no horizontal overflow at 1440, 390, and 320 pixels. The mobile screenshot was inspected. Browser launches require execution outside the sandbox; the existing cached Playwright/Chromium installation was used without adding project dependencies.

The runtime screens pass typecheck, scoped ESLint, and all 13 existing data-helper tests. Production browser verification used an isolated copy of committed app files plus these changes, with temporary cookie-triggered page/root-layout failures and a client-render failure. Checks passed for all three fallbacks, a repeated server failure, successful retry after the failure was removed, heading focus and keyboard order, hidden exception details, page titles, fresh Explore navigation, and no horizontal overflow at 1440, 390, and 320 pixels. Root-layout recovery retained its own font and styles. Desktop and mobile screenshots were inspected.

The temporary fault routes were kept outside the working repository and removed from the verification copy before checking the shipping production build. No test-only routes, cookies, dependencies, or intentionally throwing code are included in the feature branch.
