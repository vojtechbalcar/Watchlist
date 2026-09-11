---
type: decision
updated: 2026-09-11
status: current
---

# Explore sector pages

Related: [[neutral-page-design]], [[explore-frame]], [[watchlist-placeholder-data]]

## User direction and correction

Explore groups stock cards into stacked sector rows, with four cards per row on desktop. Categories must be visible together, never organized into tabs.

The user corrected the initial implementation: the cards were not visually appealing enough, “Show all” must navigate to a separate category page rather than expand inline, and the market hero/highlights add little value and should be removed.

## Current design

- `/explore` shows all nine sectors with compact descriptions, stock counts, four-card previews, and “Show all” links.
- `/explore/[sector]` shows every stock in one sector with an “All sectors” return link. Slugs are lowercase and hyphenated, including `real-estate`. Unknown sectors return a 404.
- Both views offer search, benchmark performance filters, and sorting. Category-page search stays within that category.
- Cards pair the logo and company identity, emphasize the price, and separate the daily move from the sector benchmark comparison. A centered bar visualizes the actual benchmark gap on a consistent ±3 percentage point scale, capped at the ends; the exact number is always visible.
- Watchlist membership uses a small, labeled toggle. Maroon marks membership only; green/red indicate market direction. Membership remains local to the current view and resets across routes, matching the existing demo boundary.
- Cards use neutral surfaces, subtle borders, a distinct benchmark footer, and restrained rounding. Desktop uses four columns, tablet two, and narrow mobile screens one. No hero or market highlights.
- The illustrative Explore universe now has 48 stocks so every category has entries beyond its preview. The page explicitly labels demo data; no market API or live-price integration was added.

## Rejected

Sector tabs, a sector dropdown hiding the other rows, the previous stock table, inline “Show all” expansion, the hero/highlight summary, and the first card treatment with detached company details were rejected. Decorative price histories and oversized featured cards are unnecessary here.

## Verification environment

Browser verification was delayed by an intermittent connection. The initial browser inventory was empty, so native Chrome was used for desktop inspection. Native screenshots and developer-tool shortcuts then stopped responding. Refreshing the CUA inventory exposed the connected Chrome extension; selecting the existing tab restored verification, including the viewport capability for mobile checks. Do not repeatedly retry native shortcuts when the browser connection changes.

`pnpm` was unavailable in the session PATH. The same repository scripts were run with `npm run typecheck`, `npm run lint`, and `npm run build`; no dependencies or lockfiles were changed.
