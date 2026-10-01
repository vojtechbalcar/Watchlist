---
type: decision
updated: 2026-09-30
status: current
---

# Repository hygiene

Related: [[git-commit-workflow]], [[MEMORY]]

Ignore local editor, Obsidian, and assistant settings: `.idea/`, `.vscode/`, `.obsidian/`, `.claude/`, and `.codex/`, including nested directories such as `docs/.obsidian/`. Also ignore editor swap/backup files and operating system metadata. Existing rules cover dependencies, generated builds, caches, logs, and environment files.

Remove previously tracked settings from the Git index while preserving all local copies. Keep source, assets, package manifests and lockfiles, build configuration, README, `AGENTS.md`, `CLAUDE.md`, and the Obsidian Markdown notes tracked. Blanket exclusion of documentation or all dotfiles was not adopted because it would hide shared project instructions and useful configuration.

This removes local settings from the current GitHub tree, not from existing commit history.

## Removing what production does not need (2026-09-30)

Deleted, all verified unreferenced before removal: `_to_delete/` (a 3.3 MB
source tarball), the nested `watchlist/` scaffold (a second Next.js app with its
own manifest, pinned to an older Next and imported by nothing), `public/screens/`
(8 webp screenshots superseded when the landing page moved to illustrations, see
[[landing-page-design]]), six unused components — `direction-caret`,
`explore-hero-chart`, `full-comparison-table`, `performance-chart`,
`stock-card`, `trend-line` — and the tracked `test-results/` Playwright
artifact, now ignored.

`package-lock.json` went too, which narrows the "manifests and lockfiles" rule
above to **one lockfile**: `pnpm-lock.yaml`. The npm lockfile contained no
`next-auth` entries, so it predated [[account-pages]] and `npm ci` from it
would have installed a tree that could not build. Two lockfiles that disagree
are worse than one.

Kept deliberately: `docs/` (the notes are the memory), `tests/`, and
`README.md` / `AGENTS.md` / `CLAUDE.md`. None ship to production, but they are
how the project is worked on.
