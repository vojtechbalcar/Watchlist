---
type: decision
updated: 2026-09-08
status: in-review
---

# Landing hero

Related: [[neutral-page-design]], [[git-commit-workflow]], [[watchlist-placeholder-data]]

Build only the landing hero at `/landing` on `feat/landing-hero`; keep the existing dashboard at `/` while the direction is under review. The GitHub branch was created at the existing base commit before hero implementation.

## User correction

The first hero looked too much like an application screen. The landing page must attract attention and remain only loosely related to the app's design. A compact interactive chart and benchmark panel were rejected as the hero visual. Do not apply the dashboard's density and restrained layout literally to marketing pages.

Keep the supplied headline, “Both green. One losing.” Use larger typography, more expressive composition, a maroon primary action, and a custom vector illustration. Two dimensional green arrows represent positive stock and market returns. Their labels show +18.7% and +22.1%, with a −3.4 percentage-point benchmark gap. The illustration is illustrative, not a price chart. Maroon decorates the brand backdrop; green/red express direction only.

The SVG remains sharp at different sizes, has an accessible description, and uses brief entrance animations with reduced-motion support. No extra landing sections or placeholder anchor links are added.

## Push exception

For this hero, the user's explicit instruction overrides the normal automatic-push rule: keep implementation commits local until the user tells us to push. Send the hero changes in one push after that instruction. Creating the remote branch at the unchanged base was authorized separately. Do not merge into `main` as part of this work.

## Verification

The illustrated revision passes TypeScript, ESLint, and a production build with Webpack. Visually checked in Chrome at desktop size and a 390 × 844 responsive viewport, including the illustration and footer below the fold. The SVG replaces the first draft's client-side comparison controls; the hero needs no client state or market API calls.
