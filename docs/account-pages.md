---
type: decision
updated: 2026-09-07
status: current
---

# Account pages

Related: [[neutral-page-design]], [[watchlist-placeholder-data]], [[checkpoint-2026-09-06]]

The user prioritized simple login and registration pages before the database and persisted watchlist work. The supplied screenshot guides the split introduction/form layout; the existing app determines the styling: light gray, local Helvetica Neue, thin rules, ink buttons, and restrained maroon brand accents. The screenshot's dark background, orange palette, and pill button were not adopted.

`/login` and `/register` share a responsive account layout and an email/password form with native validation, password visibility controls, and links between the pages. Registration asks for at least eight password characters. The app header links to login; the account header links back to the demo.

These are UI previews. Submission explicitly states that accounts are not available; credentials are not sent or persisted and there is no simulated successful login. Authentication method and database integration remain future work; the password UI does not choose an authentication provider.

Route groups separate the market snapshot footer from the account layout without changing existing URLs. We avoided hiding the global footer with route-dependent CSS.

Next: connect authentication and Postgres, then persist watchlist membership across Dashboard, Watchlist, and Explore. Only the cron job may request stock API prices.

## Verification

Typecheck and ESLint passed. The production build passed with `npm run build -- --webpack`, generating both account routes and all four existing market routes. Default Turbopack compilation was blocked by worker port-binding permissions, including on the escalated retry. Browser preview was unavailable, so rendered desktop/mobile layout and interactive behavior still need visual verification. `pnpm` was unavailable; npm ran the existing scripts.
