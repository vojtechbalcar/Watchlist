---
type: decision
updated: 2026-10-12
status: current
---

# Mobbin across the app

Related: [[mobbin-landing-design]], [[neutral-page-design]], [[settings-preferences]], [[resumable-setup]], [[loading-states]], [[CLAUDE-hard-rules]]

## User direction

The user extended the Mobbin redesign from the landing page to the whole app and explicitly asked us to follow root `DESIGN.md`. Its old landing-only restriction is superseded. This is a layout, typography, and interaction update, including authentication, setup, dashboard, watchlist, Compare, Explore, sector pages, stock details, settings, empty states, and recovery screens.

## Shared rules

White canvas and near-black `#141414` text. Soft `#f3f3f3` surfaces, `#f0f0f0` fields, and neutral hairlines define hierarchy without shadows. Controls are ink or neutral pills, panels have 24px corners, inputs and smaller tiles 16px, and company logos 30% squircles. Helvetica Neue uses the existing 400/500/700 faces and the local Light 300 face throughout the app. Labels use natural tracking and sentence case; ticker symbols keep standard capitalization.

Maroon remains brand only: the wordmark and terminal heading periods. Green/red remain market direction only. Saved states, selected controls, account notices, focus rings, and checkboxes use ink and neutrals. Compare lines use neutral shades and distinct dash patterns.

The shared header is a floating soft pill, with a second navigation row on phones so all four destinations remain accessible. The dashboard has a soft chart panel and quieter comparison sidebar; tables keep their numeric columns and scroll inside their own containers on phones. Chart labels retain readable sizes when the chart narrows. Loading skeletons follow the new geometry.

Rejected: retaining a second design system for the signed-in app, a color-only restyle, maroon action/selection states, shadows as elevation, tracked uppercase labels, and hiding app navigation on mobile. Preserve the landing page's compact soft footer; do not add a large dark marketing footer to workspaces.

## Verification

Implementation and desktop/mobile browser verification are in progress. The design changes preserve account actions, saved watchlist reconciliation, setup routing, comparison selection, and server-only market data access.
