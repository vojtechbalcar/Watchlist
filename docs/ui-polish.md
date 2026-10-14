# UI polish

2026-10-14 · Related: [[neutral-page-design]], [[settings-preferences]], [[explore-sector-pages]], [[stock-table-navigation]], [[account-security]]

## Direction

The user asked for an Impeccable detail pass, specifically calling out misaligned Explore dropdown arrows. Preserve the gallery-white surfaces, ink pills, natural type, maroon brand accents, and market-only green/red from [[neutral-page-design]]. This is a refinement of the current design.

Use a shared `SelectField` around the native select, with a decorative Lucide chevron centered vertically and inset 16px from the right. Reserve 44px of end padding for the arrow. Rejected replacing native selects with custom popup menus: the existing platform picker, keyboard behavior, and form semantics are useful and do not need a new interaction model. Forced-colors mode restores the platform arrow. References, IDs, disabled states, and handlers still belong to the actual select.

## Fixes

- Explore, Compare, and Settings use the same dropdown arrow placement. Mobile dropdown text is 16px, and controls are 48px tall.
- Explore search and dropdowns share the same height. The search stretches across the stacked toolbar at tablet widths.
- Explicitly associate Explore and Compare selects with their label text, so their accessible names do not include every option.
- Profile hover and open states change the avatar background. The previous border-color change was invisible because the avatar had no border. The chevron indicates the open state and respects reduced motion.
- Table sort arrows use Lucide icons aligned beside their labels, instead of Unicode glyphs that could wrap beneath them.
- Narrow phone navigation reduces horizontal padding below 361px. Before this change a 320px viewport had a 346px document width and Explore extended past the navigation pill.

## Verification

Use the user-selected isolated local Chromium browser. Check dashboard, Watchlist, Compare, Explore, Technology, Apple detail, and Settings at 1440, 1024, 768, 390, and 320px. Also inspect landing, auth pages, and setup screens. Market figures in these screenshots are disposable local UI fixtures, not market data assertions.

Verify document width, dropdown dimensions and centering, select changes, keyboard focus, profile hover/open/Escape, reduced motion, forced-colors fallback, and table sorting. Review screenshots of charts, cards, and settings controls at smaller widths. Physical devices and other browser engines are outside this pass.

## Browser troubleshooting

The shared T3 preview repeatedly disconnected; reopening and correcting calls did not provide stable snapshots. The user chose an isolated local browser. Registration against the existing development database then failed before account creation because `RateLimit` was missing, and the running server also held an older Prisma model.

Do not apply a database migration to the user's environment just to inspect design. Use a temporary app copy, a disposable local Postgres instance with migrations and UI fixtures, and a disposable account instead. Keep the local database adapter override and fixtures outside the repository. A single local Prisma client with a one-connection pool avoids connection churn in the disposable Postgres proxy. Prisma CLI migration commands require Node 22 here; the older Node 20 invocation failed while loading an ESM dependency.

Run the build before the standalone typecheck: a concurrent build replaces `.next/types`, causing transient missing-file errors in TypeScript.
