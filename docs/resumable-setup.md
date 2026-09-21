---
type: decision
updated: 2026-09-21
status: in-progress
---

# Resumable setup

Related: [[saved-watchlist]], [[watchlist-comparisons]], [[git-commit-workflow]]

The user approved saving setup progress, offering Continue setup or Start over, handling storage failures consistently, and clearing the draft after successful completion. Work is on `feat/resumable-setup`, based on the completed comparison branch. Undo removal and broader loading states are separate future work.

## Design

Store a versioned setup draft alongside membership in the existing `watchlist.stocks.v1` record. It contains the current step, sector interests, and selected ticker symbols. Each meaningful setup edit writes immediately, without a debounce that could lose the last edit on refresh. Search text remains temporary. Draft selections do not become saved watchlist membership until completion.

Existing browser records without a draft continue to work. Validate version, steps, sectors, and ticker symbols on read. A review step with no supported stocks falls back to stock selection. Corrupt drafts recover without deleting valid saved stocks.

On a return visit, Dashboard and Watchlist offer Continue setup and Start over, with a summary of saved progress. The prompt remains available if the user has independently saved stocks in Explore. Continue opens the saved step; Start over replaces only the draft with an empty first step after a successful write. Skipping saves the current draft and dismissal flag before navigating to Explore. Completing setup merges selections with current membership and clears the draft in one storage write.

Keep edits in React state when browser storage fails. Show an actionable failure and retry, without claiming the choices are saved. Failed skip, restart, and completion keep the current screen and draft. Writes must read current storage successfully before changing it; never overwrite saved stocks using a fallback snapshot after a failed read. The shared store publishes successful changes across routes and tabs. Active editors retain local choices; the latest successful draft edit wins.

Rejected: a separate draft storage key with non-atomic completion cleanup, writing every render, debounced persistence, saving only on step changes, auto-resuming without a choice, clearing progress on skip, and treating failed writes as successful navigation.

## Implementation plan

- [ ] Add failing tests for draft round-tripping, compatibility, malformed drafts, invalid review steps, successful completion, and blocked reads/writes. Extend `src/lib/watchlist-state.ts`, add a storage transaction helper, and update `src/components/watchlist-store.ts`. Verify with Node tests, TypeScript, and scoped ESLint; commit and push the storage foundation.
- [ ] Update `src/components/watchlist-setup.tsx` to initialize from a validated draft, save sector/stock/step changes, preserve local edits on failure, retry the failed action, and navigate only after successful skip. Update `watchlist-workspace.tsx` and setup styles with resume/restart choices and keyboard focus recovery.
- [ ] Build a staged snapshot and verify refresh at each step, navigation away/back, start over, successful cleanup, existing membership, storage failure/retry for edits/skip/restart/completion, malformed storage, keyboard interaction, and mobile layout in Chromium. Update current docs, run relevant checks, review the diff, commit and push the UI integration.

Validation commands: `node --experimental-strip-types --test tests/*.test.mjs`, `pnpm typecheck`, scoped `pnpm exec eslint`, and `npm run build -- --webpack` in a clean staged snapshot. Preserve unrelated settings/benchmark-spark edits and untracked assets.
