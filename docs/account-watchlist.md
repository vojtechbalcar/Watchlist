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

## Preferences too (2026-10-06)

Display and comparison preferences ([[settings-preferences]]) now sync the
same way, in `SavedPreferences` through `/api/preferences`. The client logic
moved into `createAccountSync` (`src/components/account-sync.ts`), which both
stores use. The rules moved into `reconcileAccountCopy`, where untouched
defaults count as blank and are never uploaded. Each copy has its own owner
key (`watchlist.owner.v1`, `watchlist.preferences-owner.v1`).
`usePreferencesReady` now waits for the account's preferences. The Settings
form was already disabled until then, so it can't send defaults over saved
choices. Rejected: one combined table and route, which would have tied two
unrelated forms to one request.

Verified with a throwaway account (deleted afterwards):
- settings saved in a browser before this moved into the account;
- a change in Settings reached it;
- a fresh browser opened with compact density and the 1Y period, and its
  watchlist still loaded after the refactor.

## Offline changes (2026-10-06)

A change that couldn't be sent sets `<ownerKey>:unsent` in localStorage. It
is sent again on the browser's `online` event. On the next visit it counts as
a change made while loading, so this browser's copy wins and uploads instead
of being replaced by the account's older one. Only a successful response
clears the mark (before this, any response counted as saved). Another
account signing in clears the mark, so its own change is never sent.
Rejected: a queue of individual changes. The whole copy is small, and sending
it once is enough.

Verified by switching a browser offline (throwaway account, deleted):
- a stock added offline was saved on reconnect;
- a stock added offline in a page that closed before reconnecting was still
  there on the next visit and reached the account.

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
