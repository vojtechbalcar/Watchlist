---
type: plan
updated: 2026-09-14
status: in-progress
---

# UX completion

Related: [[neutral-page-design]], [[watchlist-placeholder-data]], [[settings-preferences]], [[explore-period-comparisons]], [[git-commit-workflow]]

The user approved all seven improvements in the gap review and requested a branch for each, with Git managed autonomously. Build on `26f4122`, preserving Explore's selected-period comparisons. Keep the approved neutral visual style. Authentication and external market data remain outside this work.

## Architecture and decisions

- Use Next.js route loading fallbacks and persistent market navigation. Add section boundaries for independent failures, route retry, and branded 404/global error screens. No artificial production delays or pretend network requests.
- Persist ticker membership only in a versioned browser-storage key, shared across routes and tabs. Validate stored data and report failed writes without claiming success. Preferences remain separate. Reject per-page state and storing prices in browser storage.
- Use one stock catalog for membership identity. Keep illustrative history explicitly labeled. Support all catalog stocks in the comparison picker; bound simultaneous comparison to five for readable charts. Reject pretending expanded demo coverage is real price history.
- Derive dashboard summaries from the current selection using equal weighting, explained in the interface because watchlists have no position sizes. Reject fixed seven-stock summaries after membership changes.
- Distinguish ahead, behind, and equal performance. Handle missing/non-finite history and ranges containing losses. Pointer, touch, and keyboard inspection share a chart component.
- Keep reversible removal lightweight with Undo, persistent dismissible feedback, and useful focus restoration. Do not require deletion confirmation.

## Branches and execution

`feat/ux-completion` integrates each verified feature in sequence. Each feature branch starts from the current integration tip, receives its own focused commit, and is pushed before merging locally into integration. Push integration after each merge. Keep `main` unchanged until all work is reviewed and verified.

- [x] `feat/loading-states`: shared skeletons, route-specific fallbacks, persistent navigation, real pending-link feedback. Verify typecheck, lint, production build and browser loading presentation.
- [ ] `feat/error-recovery`: section boundary, route/global error recovery, 404. Verify recovery and section isolation with a throwing child, plus route responses.
- [ ] `feat/shared-watchlist`: validated ticker store, cross-route/tab membership, catalog identity, dashboard counts. Test corrupt/blocked storage, duplicates, unknown symbols, empty lists and reloads.
- [ ] `feat/empty-states`: first-use guidance, filter reset, empty dashboard and insufficient-history treatment. Verify empty membership and no-result searches.
- [ ] `feat/action-feedback`: add/remove messages, Undo, failed-save retry and focus recovery. Verify navigation, multiple operations, storage failure and undo failure.
- [ ] `feat/chart-comparisons`: full catalog picker, shared interactive chart, negative/equal/missing history and derived dashboard metrics. Test range scaling, return differences, empty/invalid series; inspect pointer, keyboard and touch.
- [ ] `feat/mobile-accessibility`: touch targets, semantics, skip navigation, focus, live results and responsive layouts. Run end-to-end desktop/mobile flows, reduced motion, production build, typecheck, lint, and all regression tests.

## Verification approach

Use the existing Node test runner for storage and financial-display calculations. Add browser tests for stateful flows and recovery; do not write tests that merely duplicate markup. Run TypeScript and ESLint for each branch and production builds when route boundaries or integration change. Inspect diffs before commits. Record concrete verification and limitations in [[ux-completion]] when finished.
