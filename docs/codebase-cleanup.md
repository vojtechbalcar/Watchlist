---
type: decision
updated: 2026-10-13
status: current
---

# Codebase cleanup

Related: [[account-watchlist]], [[saved-watchlist]], [[settings-preferences]], [[watchlist-comparisons]], [[postgres-prices]]

The user chose all three opportunities in the architecture review: account saved copies, shared quote loading, and benchmark chart preparation. Keep existing behavior and domain rules while concentrating ownership and testing through each module's interface.

## Decisions

- Account copies own their stable browser snapshot, synchronous writes, notifications, readiness, and account synchronization. Watchlists and preferences remain separate instances and requests. An account generation rejects stale loads and acknowledgements; uploads run in order and coalesce newer edits. Record unsent edits immediately, before debounce. Rejected: a server-only working copy, combined account requests, per-ticker merging, and more glue around the existing split lifecycle.
- Quote loading owns request deduplication, subscriber notifications, live/stored provenance, and freshness. A delayed stored answer cannot replace a newer live answer. Debounce belongs to each consumer until a request begins; a shared request survives a consumer leaving. Keep listing figures and quote payloads distinct. Rejected: a generic fetch framework, new caching dependencies, and combining unrelated payloads.
- Benchmark chart preparation resolves tracked/listed history, chooses the benchmark date axis, aligns stock histories, averages available values, and calculates the comparison domain. Rendering stays with the charts. Rejected: invented history, duplicated alignment rules, and moving SVG drawing into the data module.
- Provider permissions come from AGENTS.md. This cleanup adds no provider calls and does not widen the authorized lookup paths.

## Implementation plan

- [x] Account copies: lifecycle regressions failed before the module existed; both stores now use the owned copy and storage tests exercise that interface. Typecheck, lint, and copy/reconciliation/storage/preferences tests pass.
- [x] Quotes: nine regressions now cover shared consumers, response ordering, live/stored freshness, visible-live limits, stored batching, and failure/retry behavior. The hook only schedules consumer debounce and subscribes to the shared cache. Typecheck and lint pass; independent review found no blockers.
- [x] Charts: six complete preparation tests cover mixed tracked/listed histories, unknown values, a missing benchmark, per-period fallback, one-date/negative charts, and immutable inputs. Overview and Compare now cross the same preparation interface. Typecheck and lint pass; independent review found no blockers.
- [x] Final verification: the full workspace suite passes with the existing TypeScript resolver preloaded (167 tests). Typecheck, full ESLint, and the production Next.js build pass. Independent review found no remaining blockers. The existing eight user-owned draft files retain their original checksums and remain unstaged.

Tests use the existing Node test runner and controlled browser/HTTP adapters; no new dependencies. Checks use installed CLI entry points when the local Corepack launcher cannot resolve pnpm. Existing standing/gap changes are user-owned and stay unstaged.

## Account lifecycle investigation

The initial reproduction showed an older account load replacing a newer account's browser copy. The first consolidation added account generations and ordered uploads, but review found that this alone missed ownership reads that fail, cross-tab edits during loading, and first-sign-in edits abandoned before the load finished. Additional regressions also exposed reset and queued-upload paths bypassing ownership checks.

The fix distinguishes unknown ownership from an absent owner, hides foreign copies in memory without erasing stored data, records ownership before the first account load, notices external storage changes, and checks ownership for reset and each upload iteration. Nineteen lifecycle tests cover these cases through the same interface as both stores; the existing nine storage tests now exercise that interface too. This investigation took more than 30 minutes because isolated reconciliation and storage tests had never exercised the asynchronous lifecycle around them.

## Existing build failure

The final production build exposed two malformed compact-density selectors in `globals.css`, introduced by the preceding dead-code deletion commit (`c5b122f`). Removing the obsolete discovery-table selector had also removed the closing parenthesis and the row/logo targets. A direct PostCSS parse reproduced the same unclosed-bracket error before the fix. Restoring the intended `tbody tr` and `.stock-logo` targets while keeping the obsolete selector removed made both the parse and production build pass.

## Verification

- Workspace suite: `node --experimental-strip-types --import /tmp/watchlist-cleanup-test-runtime.mjs --test tests/*.test.mjs` — 167 passed. The temporary preload registers `tests/resolve-typescript.mjs`; the user's in-progress watchlist-state test does not register it yet.
- `node node_modules/typescript/bin/tsc --noEmit` and `node node_modules/eslint/bin/eslint.js .` pass. These are the same installed commands behind the package scripts; the local Corepack launcher currently fails its pnpm signature lookup.
- `node node_modules/next/dist/bin/next build --webpack` passes, including TypeScript and all 78 static pages. No database migration or deployment was run.
- Shared browser: Overview loaded its average chart; Compare drew the benchmark and three saved stocks with finite coordinates and changed from YTD to 1M; Explore search displayed AAPL's stored quote through the authorized live-lookup route. Account membership and preferences were not edited. Screenshot snapshots failed, but navigation, DOM inspection, and focused interactions worked.
