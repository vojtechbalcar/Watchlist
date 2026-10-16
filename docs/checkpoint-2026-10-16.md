---
type: checkpoint
updated: 2026-10-16
status: current
---

# Checkpoint — 2026-10-16

Supersedes [[checkpoint-2026-10-13]].

## Working

- Everything in [[checkpoint-2026-10-13]], plus the [[codebase-cleanup]] refactor (PR #6) and the UI polish in [[ui-polish]].
- CI on `main` passes again: typecheck, ESLint, and `pnpm test` (169 tests).
- Production prices refresh through the separate scheduler Worker, verified on 2026-10-12 ([[price-refresh-reliability]]).
- Local sign-in works once the local database has every migration ([[cloudflare-workers-deploy]]).
- Only Cloudflare builds of `main` run migrations; other branches skip them.

## Needs the user

- Optionally add a Cloudflare rate-limiting rule on `/login` and `/register` as a second layer.
- Choose an email provider before password reset can be built.

## Not done

- Password reset (needs an email provider).
- The price job's app request used about 1.3 s of CPU on 2026-10-12, so it may hit the Workers CPU limit as the tracked list grows.
- Unscheduled market closures aren't modelled.
- Old remote branches with unmerged commits: `feature/main`, `feat/loading-states`, `feat/ux-completion`, `landingPage`. Their work was rebuilt or replaced on `main`.
