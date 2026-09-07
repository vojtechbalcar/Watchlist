---
type: decision
updated: 2026-09-07
status: current
---

# Landing page

Related: [[neutral-page-design]], [[watchlist-placeholder-data]], [[git-commit-workflow]], [[missed-mac-mini-commit]]

The user requested an implemented landing page on `landingPage`. Creating the branch alone did not fulfill that request.

## Routes and design

The landing page owns `/`. The existing dashboard moved to `/dashboard`; Dashboard navigation points there. Dashboard, Watchlist, Compare, and Explore share the `(workspace)` route-group layout, which retains the market snapshot footer without putting it on the landing page. The other application URLs are unchanged.

The page uses the approved neutral background, local Helvetica Neue, thin rules, and maroon brand accents. Its hero contains actual dashboard screenshots, followed by an interactive benchmark comparison, links into the application, native expandable questions, and a final dashboard link. Maroon is not used for market direction.

The comparison reuses `compareRows`, `compareBenchmark`, and `CompareChart`. Its stock and period controls change both the figures and chart. All values are explicitly illustrative; no stock API or new price source was added. The questions accurately describe the demo's lack of accounts, persistence, and live quotes.

Rejected: building in the untracked nested `watchlist/` scaffold, replacing the approved dashboard, inventing live data or account flows, and absolutely positioning the preview behind the hero copy. The latter overlapped on short mobile screens; the hero now reserves space for both text and imagery.

TypeScript includes are scoped to the root app and its configuration files so the unrelated nested scaffold does not enter the root application's checks. Landing styles use a CSS module to avoid changing the existing application styles. Lucide supplies the new icons.

## Verification

- TypeScript and scoped ESLint checks pass.
- The production build passes with `npm run build -- --webpack` and generates all five routes.
- Playwright checks cover 320, 390, 768, 1280, 1440, and 1920 pixel widths, including short viewports. Landing content has no page overflow or hero overlap, and the following section remains visible.
- Checked stock and period changes, benchmark arithmetic and chart updates, mouse and keyboard FAQ toggles, dashboard entry, all application navigation links, and return to the landing page. No browser runtime errors or failed requests were observed.
- Existing limitation: Compare overflows at 320px. Its source and styles are unchanged by this landing work; application routes pass the overflow check at 390px and above.

## Environment troubleshooting

Verification took more than 30 minutes, including sandbox permission waits. Dependencies were initially missing; `npm ci` restored the existing lockfile. Browser downloads, Chromium startup, and the dev server needed sandbox permission. Turbopack production compilation failed while binding its CSS worker's port, including after an escalated retry. The Webpack production build completed successfully; the default build script was left unchanged.

The development server uses `http://127.0.0.1:3001` because port 3000 was already occupied. Next.js also appended its generated rules block to `AGENTS.md`; that unrelated generated change is excluded from the landing commit.
