---
type: decision
updated: 2026-09-30
status: current
---

# Account pages

Related: [[neutral-page-design]], [[watchlist-placeholder-data]], [[checkpoint-2026-09-06]], [[postgres-prices]], [[settings-preferences]]

The user prioritized simple login and registration pages before the database and persisted watchlist work. The supplied screenshot guides the split introduction/form layout; the existing app determines the styling: light gray, local Helvetica Neue, thin rules, ink buttons, and restrained maroon brand accents. The screenshot's dark background, orange palette, and pill button were not adopted.

`/login` and `/register` share a responsive account layout and an email/password form with native validation, password visibility controls, and links between the pages. Registration asks for at least eight password characters. The app header links to login; the account header links back to the demo.

## Authentication (2026-09-30)

Accounts are real now. Auth.js (`next-auth` v5 beta) with the Credentials provider signs people in by email and password; the session is a signed JWT cookie (`AUTH_SECRET`), so `User` is the only auth table. Passwords are hashed with Node's built-in scrypt as `salt:hash` hex — no bcrypt/argon2 dependency. Emails are stored lowercased so sign-in is case-insensitive.

Access: `/landing`, `/login`, and `/register` are public. Every market page needs a session. `src/proxy.ts` is the optimistic gate, built from the database-free `src/auth.config.ts` (see [[cloudflare-workers-deploy]]) (bare `/` goes to `/landing`, other pages go to `/login?callbackUrl=…`, signed-in visitors skip the account pages); the `(market)` layout checks `auth()` again as the real guarantee and provides the account to client components. `callbackUrl` is reduced to a path before redirecting so it can't send people off-site.

Registration validates email and 8+ character passwords on the server, rejects existing emails, then signs in immediately. Log out lives in the profile menu and Settings and returns to `/landing`.

Rejected: database sessions and OAuth providers (Credentials requires JWT sessions, and email/password matches the existing UI); keeping the market pages as an open demo alongside accounts.

Still browser-only: preferences and watchlist membership. Persisting them per user is next.

Route groups separate the market snapshot footer from the account layout without changing existing URLs. We avoided hiding the global footer with route-dependent CSS.

Next: persist watchlist membership and preferences per user in Postgres. Only the cron job may request stock API prices.

## Verification

2026-09-30: typecheck and ESLint passed; the `add_users` migration is applied. Against the dev server: signed-out `/` → `/landing`, market pages → `/login`; a throwaway user was rejected with a wrong password, signed in with a differently cased email, loaded `/watchlist` and `/settings`, and was redirected away from `/login`; the user was then deleted. The register/logout server actions were not driven in a browser (Playwright's browser isn't installed). `pnpm` fails through corepack with a signature-key error; npm/npx ran the scripts.

Earlier (UI only): 
Typecheck and ESLint passed. The production build passed with `npm run build -- --webpack`, generating both account routes and all four existing market routes. Default Turbopack compilation was blocked by worker port-binding permissions, including on the escalated retry. Browser preview was unavailable, so rendered desktop/mobile layout and interactive behavior still need visual verification. `pnpm` was unavailable; npm ran the existing scripts.
