---
type: decision
updated: 2026-10-06
status: current
---

# Watchlist saved to the account

Related: [[saved-watchlist]], [[account-pages]], [[stock-search-and-price-schedule]], [[resumable-setup]]

Until 2026-10-06 the watchlist lived only in the browser's `localStorage`
(see [[saved-watchlist]]), so it didn't follow a user to another browser or
device and vanished with cleared site data. The user agreed to fix that next.
It is now stored per account in Postgres.

## Decisions

- **One row per account.** `SavedWatchlist` holds the whole `WatchlistState`
  (tickers, setup flags, setup draft) as JSON, cascading with `User`.
  Rejected: a row per ticker. Order, the setup draft, and the flags would each
  need their own columns, and the list is always read and written whole.
- **The browser copy stays the working copy.** Every change is still a
  synchronous `localStorage` write (instant, synced across tabs, with the
  existing undo and error handling) and is then sent whole to
  `PUT /api/watchlist` 400 ms later, with `keepalive`. Rejected: making
  the server the only copy, which would make every add and remove wait on a
  round trip and rewrite the store's synchronous API.
- **Last write wins** across devices. Rejected: per-ticker merging, which a
  watchlist this size doesn't need.
- **How the two copies meet** (`reconcileWatchlist`, tested):
  - On load, the account's list replaces the browser copy, unless the user
    changed something while it was loading.
  - A list saved before accounts existed moves into the first account that
    signs in on that browser.
  - `watchlist.owner.v1` records which account the browser copy belongs to.
    Another account signing in on the same browser neither sees nor uploads it.
- **Pages wait for the account's list.** `useWatchlistReady` replaces
  `usePreferencesReady` on the watchlist, dashboard, Compare, Explore, and
  stock pages, so nobody briefly sees an empty list (or another account's).
  After 8 seconds, or when offline, they fall back to the browser copy, and
  the next change tries to save again.
- Server input goes through the browser's own `parseWatchlist`, so a bad
  request becomes a valid list rather than an error.

## Not covered

- Display and comparison preferences ([[settings-preferences]]) are still
  per browser.
- A change made offline is saved only when the next change goes through.

## Verification (2026-10-06)

- 97 Node tests, including the five sync rules. Typecheck and ESLint pass.
- The migration was applied with `prisma migrate deploy`. Beforehand,
  `migrate diff` against the live database showed only the new table.
- In the browser, with a throwaway account that was deleted afterwards:
  - a list made before accounts moved into the account;
  - a fresh browser on the same account loaded it;
  - a stock added there reached the account;
  - another account on the first browser saw the new-account setup, with no
    rows, and saved nothing.
