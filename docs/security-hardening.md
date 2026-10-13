---
type: decision
updated: 2026-10-13
status: current
---

# Security hardening

Related: [[account-security]], [[account-pages]], [[cloudflare-workers-deploy]], [[checkpoint-2026-10-13]]

On 13 October 2026 the user asked what was left to finish the project, "like security", then said to do all of it. Rate limits, password change, account deletion, and session revocation were already on `main` from the previous evening ([[account-security]]). This change adds what was still missing:

- **Headers.** `next.config.ts` sends a CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, a referrer policy, and a permissions policy on every response. The CSP keeps `'unsafe-inline'` for Next's inline bootstrap scripts (and `'unsafe-eval'` plus websockets in development only). It allows `https:` images for the Twelve Data logos of untracked stocks.
- **Cron secret.** `isCronRequest` compared `CRON_SECRET` with `===`. It now compares SHA-256 digests with `timingSafeEqual` (`src/lib/request-guards.ts`).
- **Body cap.** `PUT /api/watchlist` and `/api/preferences` reject bodies over 64 KB with 413 before parsing them.
- **Privacy notice.** A public `/privacy` page lists what is stored, where, and how to delete it. It is linked from the landing footer, the auth pages, and Settings.
- **CI.** `.github/workflows/ci.yml` runs `next typegen`, the typecheck, ESLint, and the Node tests on every push and pull request. `next typegen` is needed because `PageProps` and `LayoutProps` are generated types, and a fresh checkout has none. ESLint now ignores `.open-next/` and `.wrangler/`, which crashed it locally.

Rejected:

- A nonce-based CSP, which would make every page dynamic, including the static `/landing`.
- A Cloudflare Rate Limiting rule in place of the app's limiter. It needs dashboard setup and allows only 10- or 60-second periods; it can still be added as a second layer.

## The duplicate that wasn't merged

This work was first built on `feature/main` (commits `16531b5`, `c2f30ff`, `7f836c6`, `bac9093`), including a second rate limiter and a second account deletion. `main` had already gained both, so those commits were not merged. Only the pieces above were rebuilt on a branch from `main`. **Before auditing or starting work, compare against `origin/main`, not just the checked-out branch.**

## Verification

Typecheck, ESLint on the whole repo, and 133 Node tests pass, including new ones for the cron secret and the body cap. Against the dev server, `/privacy`, `/landing`, `/login` and `/register` load signed out with the security headers, and the cron route returns 401 for a wrong secret. Earlier, on `feature/main`, a throwaway account was registered and deleted in an isolated browser context with no CSP errors; it left no rows behind.
