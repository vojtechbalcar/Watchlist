---
type: decision
updated: 2026-09-30
status: current
---

# Settings preferences

Related: [[account-pages]], [[neutral-page-design]], [[watchlist-placeholder-data]]

Settings are available at `/settings` through the profile avatar dropdown. The page follows the existing neutral surfaces, Helvetica, compact typography, and ruled sections.

The current app has no authentication backend. Preferences therefore persist in this browser under the versioned `watchlist.preferences.v1` key: display name and derived initials, table density, company logos and names, benchmark gap bars, dashboard market summary, reduced motion, default comparison period, and watchlist sorting, direction, and filtering. Changes propagate across views and browser tabs; malformed fields recover to defaults. Blocked writes report failure without presenting an unsaved value as saved.

Export downloads the preferences as JSON. Reset asks for confirmation and removes only the preference key, preserving other site data. The page explains that accounts, security, notifications, currencies, and additional benchmark choices depend on future backend/data support.

Rejected: controls that imply working account security or alerts without the necessary services, relabeling USD prices as another currency, and changing benchmarks without matching return data. No price APIs were added. Settings use browser storage only for preferences; the Postgres-only price boundary remains unchanged.

Default sorting and filters apply when views open; in-page controls can override them. The selected comparison period updates Compare's existing illustrative return calculations. Table display preferences apply across market pages; reduced motion respects the operating-system setting too.

The comparison period also supplies the initial range for Explore and its category pages; see [[explore-period-comparisons]].

Controls stay disabled until React has hydrated the form. Native selects otherwise appear editable even when the JavaScript that saves them has not loaded. A browser check using an unapproved development origin reproduced that misleading state; the readiness guard prevents those unsaved edits. Tests must use the server's advertised localhost origin.

## Profile initials (2026-09-30)

The user corrected the avatar initials. The rule is the **first and second**
name's initials; a single name contributes only its own first letter. The old
code took the first and *last* word, so "Alex Taylor Morgan" rendered `AM`
instead of `AT`.

The more visible half of the correction was the source of the name. Every
market page passed `SiteHeader` a hardcoded `initials="JR"`, and
`profileInitials` used it as its fallback, so a signed-in visitor who had not
set a display name saw another person's initials — demo data outliving the demo
(see [[watchlist-placeholder-data]]). `profileName` now resolves the display
name, then the account name, then the email, and both the header avatar and the
Settings avatar draw from it. An email has no second word, so it yields one
letter. The `initials` prop is gone from `SiteHeader` and `ProfileMenu`.

Rejected: keeping a literal fallback of any kind. With accounts real
([[account-pages]]), there is always a name or an email to draw from, and an
invented placeholder misrepresents whose account is open.

## Verification

`pnpm typecheck`, ESLint on affected files, and `pnpm build --webpack` passed. Four storage-validation tests pass with `node --experimental-strip-types --test tests/preferences.test.mjs`. Browser checks covered every display control, profile initials, defaults, reload persistence, cross-tab updates, export, reset/cancel, corrupt storage, blocked writes, keyboard menu dismissal, and mobile overflow. Desktop and mobile screenshots were inspected.
