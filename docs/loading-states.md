---
type: decision
updated: 2026-09-21
status: current
---

# Loading states

Related: [[undo-stock-removal]], [[resumable-setup]], [[watchlist-placeholder-data]], [[CLAUDE-hard-rules]], [[git-commit-workflow]]

The user approved layout-shaped skeletons, a pending state on the header link
the user clicked, and route boundaries built to carry the Postgres reads that
[[watchlist-placeholder-data]] describes. Work continues on
`feat/resumable-setup`. Real accounts and market data are the next item.

## Design

Before this, the watchlist and Compare showed a centred text line while waiting
for hydration, Explore silently disabled its membership buttons, and no route
had a `loading.tsx`, so a navigation gave no feedback between the click and the
new page. All three gaps are the same gap: the app never says it is working.

A skeleton stands in for the content it replaces, at the size the content will
occupy, so nothing jumps when data lands. One `Skeleton` primitive draws a
dimmed block; the shimmer stops under the existing reduced-motion preference.
Per-surface skeletons — the watchlist table, the overview card, the Explore
grid, the Compare frame, the market bar, and Settings — live together in one
module, because their value is looking like the real thing and they drift
otherwise. Skeletons say nothing to a screen reader, so each boundary keeps a
`role="status"` line naming what is loading.

Every market route gets a `loading.tsx` that renders the page header, so the
shell stays put during a navigation and only the content area changes. The
dashboard moved into a `(dashboard)` route group for this: a `loading.tsx`
beside it in `(market)` would wrap every sibling route too, and each of them
painted the dashboard's skeleton before its own. The group leaves the URL alone
and gives the dashboard a boundary that reaches nothing else. The
header renders its nav through a client `NavLink` that reads Next's
`useLinkStatus`; the clicked link marks itself busy immediately, which is the
only feedback available in the moment before the route changes.

The server pages wrap their data-dependent content in a Suspense boundary whose
fallback is the same skeleton. Today the data is a synchronous module import
and the boundary resolves at once. When prices move to Postgres, the read
becomes async behind that boundary and no loading UI changes.

Rejected: a top progress bar, which is a second loading language layered over
the skeletons and lives outside the page's own layout; keeping the text lines,
which jump the layout when content arrives; a delay before showing skeletons,
which puts a timer in every boundary; and leaving route boundaries until real
data exists, which would revisit every one of these surfaces in the next item.

## Implementation plan

- [x] Add the `Skeleton` primitive and its reduced-motion-aware styles, then the
      per-surface skeletons in `src/components/skeletons.tsx`, each matching the
      real component's dimensions.
- [x] Add `NavLink` with `useLinkStatus` and use it in `src/components/site-header.tsx`.
- [x] Add `loading.tsx` for the dashboard, watchlist, compare, explore,
      explore/[sector], and settings routes, and wrap each page's content in a
      Suspense boundary with the matching fallback.
- [x] Replace the hydration text gates in `watchlist-workspace.tsx` and
      `compare-view.tsx` with the skeletons, keeping an announced status line.
- [x] Verify in Chromium: skeletons appear under throttling, the clicked nav link
      reports busy, no layout shift when content replaces a skeleton, reduced
      motion stops the shimmer, and mobile layout at 390px and 320px. Update the
      docs, review the diff, commit and push.

Validation commands: `node --experimental-strip-types --test tests/*.test.mjs`,
`pnpm typecheck`, scoped `pnpm exec eslint`. Preserve the unrelated
settings/benchmark-spark edits and untracked assets.

## Verification

All 39 Node tests, TypeScript, and scoped ESLint pass.

Chromium with scripting disabled confirmed each route serves its own skeleton —
the right header link marked current, the market bar only on the dashboard, and
a named status line per boundary. Before the `(dashboard)` route group, every
route served the dashboard skeleton instead; that is what the group fixes.
Cumulative layout shift stays near zero when content replaces a skeleton
(0.0009 watchlist, 0 dashboard and Explore, 0.0168 Compare). A throttled
navigation showed the clicked nav link marked `aria-busy` with its brand
underline until the new route rendered. Reduced motion resolves the skeleton's
animation to `none`. No page overflow at 390px or 320px on any route.

Fixed-width skeletons were the recurring mistake: a 320px intro line, a
340-wide chart caption, and toolbar blocks each pushed a page wider than the
real content ever does, because text shrinks and a fixed block does not. The
skeletons in constrained columns now use percentage widths, and the market bar
clips like the real one.
