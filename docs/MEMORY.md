# Watchlist memory

## Current state

- [[explore-stock-details]] — clickable Explore cards, overview-style stock comparisons, shared black SVG symbols, and removal of the demo footer.
- [[resumable-setup]] — saved setup drafts, continue/restart choices, and storage failure recovery.
- [[undo-stock-removal]] — position-preserving undo for accidental removals.
- [[loading-states]] — skeletons, pending navigation, and route boundaries ready for real data.
- [[postgres-prices]] — schema, cron, and the replacement of demo prices; blocked on credentials.
- [[watchlist-comparisons]] — consistent return data and comparison selection from saved stocks.
- [[saved-watchlist]] — shared browser membership and the existing setup flow, verified as Compare's prerequisite.

- [[error-screens]] — custom 404 and runtime-error recovery on a separate branch.

- [[explore-period-comparisons]] — selected-period stock/benchmark returns on sector cards; recovery of the interrupted local draft during pull.

- [[explore-sector-pages]] — four-card sector rows, dedicated category pages, redesigned cards, and the correction to remove the hero and inline expansion.

- [[settings-preferences]] — profile dropdown and browser-persisted display and comparison preferences.

- [[landing-page-design]] — full landing-page direction and the user's correction to replace literal screenshots with minimal product illustrations.

- [[landing-hero]] — merged three-tile landing design, with a registration CTA tile and detailed illustrative benchmark graph on `feat/landing-tile-details`.

- [[repository-hygiene]] — ignore local tool settings while keeping shared instructions and project notes tracked.

- [[account-pages]] — login/register UI before database integration; previews do not authenticate.

- [[checkpoint-2026-09-06]] — completed work, verification, current limitations, and next steps.
- [[neutral-page-design]] — current visual rules and the correction that Compare and Explore need structural redesigns, not just new colors.
- [[git-commit-workflow]] — automatically commit and push each completed, verified change to GitHub.
- [[watchlist-placeholder-data]] — demo data, illustrative histories, and the future Postgres boundary.
- [[CLAUDE-hard-rules]] — market data access, brand/direction colors, and product language.

## Historical implementation decisions

These notes retain the original Figma rationale. Their current-status callouts link to the design that supersedes the old layouts.

- [[design-tokens-from-figma]] — original token system and why exported fixed-position React was rebuilt.
- [[watchlist-table-frame]] — original table frame and mock/data discrepancies.
- [[compare-frame]] — derived matrix arithmetic, series identity, and original chart limitations.
- [[explore-frame]] — sector-index mapping and original card/hero scope.

## Troubleshooting

- [[mcp-config-leading-space-gotcha]] — configuration filename issue and sensitive settings handling.
