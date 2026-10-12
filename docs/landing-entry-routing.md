---
type: decision
updated: 2026-10-12
status: current
---

# Landing entry routing

Related: [[landing-hero]], [[landing-page-design]], [[account-pages]], [[account-watchlist]], [[resumable-setup]]

The landing page's account-first entry now uses the real session and the account's reconciled setup state. This replaces the temporary `/register` destinations recorded in [[landing-hero]] and [[landing-page-design]].

All seven watchlist CTAs (header, hero, four app-tour panels, and closing section) share `WatchlistEntryLink`, a native link to `/watchlist?setup=continue`. The landing page remains static: it reads neither session cookies nor the database. The full navigation checks the current session on click and loads the current account copy, including when another tab has signed in or out since the landing page opened.

## Entry behavior

- Signed out: the existing authentication proxy redirects to `/login`, preserving the full watchlist URL in `callbackUrl`. Login and registration preserve that callback in both their forms and the links between them.
- Signed in with unfinished setup: the market layout validates the session, then `WatchlistWorkspace` waits for `useWatchlistReady`. Only after account reconciliation does the entry flag open the existing wizard, initialized with its saved draft or the empty first step.
- Signed in with completed setup: the existing watchlist opens, including the empty state after all stocks have been removed.
- Skipped setup is an intentional choice. Entry preserves the existing workspace and its saved-progress choices. Legacy nonempty watchlists also bypass the wizard even if their older record lacks a completion flag.

Ordinary `/watchlist` and dashboard visits keep their existing Continue setup prompt. The landing entry is the explicit request to resume an unfinished wizard. It neither changes saved state nor creates a second setup implementation. Account ownership and unsent-change reconciliation remain the responsibility of [[account-watchlist]].

## Rejected approaches

- Reading auth/setup in the landing page would make otherwise static product content depend on session and database availability.
- Checking only localStorage on the landing page could use another account's state or ignore a newer server copy.
- A new `/start` handler with another database lookup would duplicate the existing session gate and miss the browser/account reconciliation rules.
- Prefetching an account-sensitive entry could decide the destination before a later sign-in, sign-out, or setup change. A native link also starts a fresh account sync.
- Sending every user to registration or automatically reopening skipped/completed setup would disregard returning users' existing state.

## Verification

`tests/landing-entry.test.mjs` renders the real landing page and account forms, runs Auth.js with signed-out and valid-session requests, checks setup decisions, and exercises account reconciliation before the entry decision. The initial regression run failed for the hardcoded registration links and missing resume behavior. All 119 Node tests, TypeScript, and scoped ESLint pass.

The Auth.js test fixes its origin with `AUTH_URL` and supplies Next's `x-forwarded-proto` request header. Without that header Auth.js assumes HTTPS and looks for the secure session-cookie prefix, incorrectly rejecting the fixture's HTTP cookie.

Browser verification steps:

1. Signed out, click any watchlist CTA on `/landing`. Confirm login opens with the callback, switch to registration and back, then sign in; entry must still target `/watchlist?setup=continue`.
2. With a fresh account, enter from `/landing`: setup opens at step one. Save unfinished selections, leave for `/landing`, and enter again: the same wizard step and selections return after account data loads.
3. Complete setup and re-enter from `/landing`: the watchlist appears. Repeat with an intentionally skipped setup and with a completed but empty list; neither should automatically reopen the wizard.
