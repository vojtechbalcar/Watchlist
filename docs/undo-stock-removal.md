---
type: decision
updated: 2026-09-21
status: current
---

# Undo stock removal

Related: [[saved-watchlist]], [[resumable-setup]], [[watchlist-comparisons]], [[git-commit-workflow]]

The user approved making an accidental removal easy to reverse, restoring the
stock to the position it held before removal. Work continues on
`feat/resumable-setup`, on top of the completed resumable setup. Broader loading
states and real accounts are separate later work.

## Design

Removal keeps the stock's place. Membership is an ordered array, and the
"original" watchlist sort renders it directly, so a removal that forgets the
index makes undo move the row. `withoutTicker` returns the removed index
alongside the shorter list, and `withTickerAt` puts the ticker back, clamped to
the list that exists at restore time and refusing duplicates. State wrappers
carry these over saved membership and over the setup draft's selections.

The store exposes `removeWatchlistStock`, returning whether the write succeeded
and the index it removed, and `restoreWatchlistStock` for the reverse. Both run
through the existing `writeState` path, so they read current storage before
changing it and publish across routes and tabs. `toggleWatchlistStock` remains
the add direction.

One removal is undoable at a time. `useRemovalUndo` holds the pending
`{ ticker, index }`; a second removal replaces it, undoing clears it, and
navigation unmounts it. A pending undo whose ticker reappears — added back in
Explore or in another tab — clears itself instead of offering a stale restore.
A failed restore keeps the notice on screen and asks for a retry, in the voice
of the existing storage failures, without claiming the stock came back.

The undo appears where the stock was, never as a floating toast. On the
watchlist table a dimmed row occupies the removed row's visible index, reading
that the stock was removed and offering Undo; focus moves to that button
because the row's remove control is gone. Tab counts and the footer count
exclude the stock, because it is removed. Changing sort, filter, or search
dismisses the placeholder, since its position no longer means anything. An
Explore card stays in place, its membership button returning to Add with an
Undo beside it. A setup chip stays in place, dimmed, offering Undo.

Rejected: appending on undo, which moves the row and so is not an undo; a
floating toast, which covers content on narrow screens and needs its own focus
and dismissal rules; a timed dismissal, which can expire while the user is
reading it; and a persisted "recently removed" bin, which adds stored state and
new storage-failure paths for a reversal that only matters immediately.

## Implementation plan

- [ ] Add failing tests for `withoutTicker`/`withTickerAt` (index returned,
      clamped restore after the list shrank, no-op when already present, absent
      ticker), for the state wrappers over membership and draft selections, and
      for the store paths under a failing storage asserting nothing is written.
      Extend `src/lib/watchlist-state.ts` and `src/components/watchlist-store.ts`.
- [ ] Add `useRemovalUndo` and wire the three surfaces: the dimmed placeholder
      row and focus move in `src/components/watchlist-table.tsx`, the inline Undo
      in `src/components/explore-card.tsx` and its Explore owner, and the dimmed
      chip in `src/components/watchlist-setup.tsx`. Dismiss the table placeholder
      on sort, filter, and search changes.
- [ ] Verify in Chromium: remove and undo on each surface, position preserved
      under the original sort, placeholder dismissal on sort/filter/search, a
      second removal replacing the first, cross-tab re-add clearing the pending
      undo, failed restore and retry, keyboard focus reaching Undo, and mobile
      layout at 390px and 320px. Update the docs, review the diff, commit and push.

Validation commands: `node --experimental-strip-types --test tests/*.test.mjs`,
`pnpm typecheck`, scoped `pnpm exec eslint`. Preserve the unrelated
settings/benchmark-spark edits and untracked assets.

## Verification

Pending.
