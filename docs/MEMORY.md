# Watchlist memory

## Current state

- [[stock-table-navigation]] — company-cell detail links across stock tables and rankings, full-catalog SVG coverage, and refined icon sizing.
- [[explore-stock-details]] — clickable Explore cards, overview-style stock comparisons, shared black SVG symbols, and removal of the demo footer.
- [[resumable-setup]] — saved setup drafts, continue/restart choices, and storage failure recovery.
- [[undo-stock-removal]] — position-preserving undo for accidental removals.
- [[loading-states]] — skeletons, pending navigation, and route boundaries ready for real data.
- [[stock-search-and-price-schedule]] — Twelve Data budget, scheduled refresh of tracked stocks, live-priced search dropdown.
- [[postgres-prices]] — schema, price snapshot, and real prices and charts on every signed-in page.
- [[watchlist-comparisons]] — consistent return data and comparison selection from saved stocks.
- [[saved-watchlist]] — shared browser membership and the existing setup flow, verified as Compare's prerequisite.

- [[error-screens]] — custom 404 and runtime-error recovery on a separate branch.

- [[explore-period-comparisons]] — selected-period stock/benchmark returns on sector cards; recovery of the interrupted local draft during pull.

- [[explore-sector-pages]] — four-card sector rows, dedicated category pages, redesigned cards, and the correction to remove the hero and inline expansion.

- [[settings-preferences]] — profile dropdown and browser-persisted display and comparison preferences.

- [[landing-page-design]] — full landing-page direction and the user's correction to replace literal screenshots with minimal product illustrations.

- [[landing-hero]] — open hero with no panels: huge headline, two drawn return lines and the gap between them. Panelled heroes were rejected; [[landing-hero-editorial-plan]] is superseded.

- [[repository-hygiene]] — ignore local tool settings while keeping shared instructions and project notes tracked.

- [[account-watchlist]] — the watchlist saved per account in Postgres, with the browser copy kept as the instant working copy.

- [[account-pages]] — email/password accounts with Auth.js, gated market pages, and what is still browser-only.

- [[checkpoint-2026-10-06]] — current state: what works, what's blocked on the Worker secrets, and what's next.
- [[checkpoint-2026-09-06]] — earlier checkpoint, superseded.
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

- [[cloudflare-workers-deploy]] — OpenNext on Workers: pg's workerd export, DB-free proxy, wasm-safe Prisma generator, per-request client.
- [[prisma-build-without-database]] — client generation during installation must not require database credentials.
- [[mcp-config-leading-space-gotcha]] — configuration filename issue and sensitive settings handling.
