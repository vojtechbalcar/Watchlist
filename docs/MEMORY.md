# Watchlist memory

## Current state

- [[ui-polish]] — native dropdown arrow alignment, responsive search/navigation, table sort icons, profile feedback, and isolated-browser verification.

- [[codebase-cleanup]] — account saved-copy lifecycle, shared quote loading, and benchmark chart preparation; preserves the browser working copy and stored market data rules.

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

- [[mobbin-landing-design]] — the landing page rebuilt from Mobbin's `DESIGN.md`: the Watchlist adaptations (maroon as the single accent, Helvetica Neue in place of Saans), the minimal statement, the soft footer card, and the user's corrections along the way.

- [[landing-hero]] — the hero is an illustration: company tiles orbiting the S&P 500, drawn as a fan of twelve monthly petals. It replaced the race hero, which the user rejected for an illustration that breathes; that replaced the open line-chart hero, called bland. Panelled heroes were rejected; [[landing-hero-editorial-plan]] is superseded.

- [[repository-hygiene]] — ignore local tool settings while keeping shared instructions and project notes tracked.

- [[account-watchlist]] — the watchlist saved per account in Postgres, with the browser copy kept as the instant working copy.

- [[account-pages]] — email/password accounts with Auth.js and gated market pages.

- [[account-security]] — password change, account deletion, session revocation via `sessionVersion`, and sign-in/registration rate limits.
- [[password-reset]] — emailed single-use reset links through Resend (Postmark, then Cloudflare Email Sending, were considered first), hashed tokens, and why the link's host comes only from `Host`.

- [[checkpoint-2026-10-16]] — current state: what works, what needs the user, and what's not done.
- [[security-hardening]] — security headers, constant-time cron secret, body caps, privacy notice, and CI; plus the duplicate work that wasn't merged.
- [[checkpoint-2026-10-13]] — earlier checkpoint, superseded.
- [[checkpoint-2026-10-06]] — earlier checkpoint, superseded.
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

- [[cloudflare-workers-deploy]] — OpenNext on Workers: pg's workerd export, DB-free proxy, wasm-safe Prisma generator, per-request client; only `main` builds migrate, and local dev needs `pnpm db:deploy`.
- [[prisma-build-without-database]] — client generation during installation must not require database credentials.
- [[mcp-config-leading-space-gotcha]] — configuration filename issue and sensitive settings handling.
