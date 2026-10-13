---
type: checkpoint
updated: 2026-10-13
status: current
---

# Checkpoint — 2026-10-13

Supersedes [[checkpoint-2026-10-06]].

## Working

- The landing page and the whole app follow Mobbin's design language ([[mobbin-landing-design]], [[mobbin-app-design]]).
- Accounts with per-account watchlists and preferences, password change, account deletion, and rate-limited sign-in ([[account-security]]).
- Security headers, a constant-time cron secret, capped request bodies, and a privacy notice ([[security-hardening]]).
- CI runs the typecheck, ESLint, and the Node tests on every push.

## Needs the user

- Confirm production prices refresh with the real Twelve Data key ([[price-refresh-reliability]]).
- Optionally add a Cloudflare rate-limiting rule on `/login` and `/register` as a second layer.

## Not done

- Password reset (needs an email provider).
- Unscheduled market closures aren't modelled.
