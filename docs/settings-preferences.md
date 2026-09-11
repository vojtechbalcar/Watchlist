---
type: decision
updated: 2026-09-11
status: current
---

# Settings preferences

Related: [[account-pages]], [[neutral-page-design]], [[watchlist-placeholder-data]]

Settings are available at `/settings` through the profile avatar dropdown. The page follows the existing neutral surfaces, Helvetica, compact typography, and ruled sections.

The current app has no authentication backend. Preferences therefore persist in this browser under the versioned `watchlist.preferences.v1` key: display name and derived initials, table density, company logos and names, benchmark gap bars, dashboard market summary, reduced motion, default comparison period, and watchlist sorting, direction, and filtering. Changes propagate across views and browser tabs; malformed fields recover to defaults. Blocked writes report failure without presenting an unsaved value as saved.

Export downloads the preferences as JSON. Reset asks for confirmation and removes only the preference key, preserving other site data. The page explains that accounts, security, notifications, currencies, and additional benchmark choices depend on future backend/data support.

Rejected: controls that imply working account security or alerts without the necessary services, relabeling USD prices as another currency, and changing benchmarks without matching return data. No price APIs were added. Settings use browser storage only for preferences; the Postgres-only price boundary remains unchanged.

Default sorting and filters apply when views open; in-page controls can override them. The selected comparison period updates Compare's existing illustrative return calculations. Table display preferences apply across market pages; reduced motion respects the operating-system setting too.

## Verification

`pnpm typecheck`, ESLint on affected files, and `pnpm build --webpack` passed. Four storage-validation tests pass with `node --experimental-strip-types --test tests/preferences.test.mjs`. Browser checks covered every display control, profile initials, defaults, reload persistence, cross-tab updates, export, reset/cancel, corrupt storage, blocked writes, keyboard menu dismissal, and mobile overflow. Desktop and mobile screenshots were inspected.
