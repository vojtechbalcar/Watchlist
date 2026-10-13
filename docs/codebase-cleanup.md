---
type: decision
updated: 2026-10-13
status: in-progress
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
- [ ] Quotes: add concurrent consumer and response-order regressions, verify they fail, centralize requests/cache/notifications, verify debounce/failure/freshness behavior, typecheck and lint, commit and push.
- [ ] Charts: add complete chart-preparation tests, verify they fail, move repeated preparation into a pure module, verify missing/mixed/negative histories and migrate both callers, typecheck and lint, commit and push.
- [ ] Final verification: inspect the full diff, run the complete suite, confirm existing user files are preserved, and verify GitHub has each completed commit.

Tests use the existing Node test runner and controlled browser/HTTP adapters; no new dependencies. Checks use installed CLI entry points when the local Corepack launcher cannot resolve pnpm. Existing standing/gap changes are user-owned and stay unstaged.

## Account lifecycle investigation

The initial reproduction showed an older account load replacing a newer account's browser copy. The first consolidation added account generations and ordered uploads, but review found that this alone missed ownership reads that fail, cross-tab edits during loading, and first-sign-in edits abandoned before the load finished. Additional regressions also exposed reset and queued-upload paths bypassing ownership checks.

The fix distinguishes unknown ownership from an absent owner, hides foreign copies in memory without erasing stored data, records ownership before the first account load, notices external storage changes, and checks ownership for reset and each upload iteration. Nineteen lifecycle tests cover these cases through the same interface as both stores; the existing nine storage tests now exercise that interface too. This investigation took more than 30 minutes because isolated reconciliation and storage tests had never exercised the asynchronous lifecycle around them.
