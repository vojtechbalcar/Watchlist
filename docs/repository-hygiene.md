---
type: decision
updated: 2026-09-07
status: current
---

# Repository hygiene

Related: [[git-commit-workflow]], [[MEMORY]]

Ignore local editor, Obsidian, and assistant settings: `.idea/`, `.vscode/`, `.obsidian/`, `.claude/`, and `.codex/`, including nested directories such as `docs/.obsidian/`. Also ignore editor swap/backup files and operating system metadata. Existing rules cover dependencies, generated builds, caches, logs, and environment files.

Remove previously tracked settings from the Git index while preserving all local copies. Keep source, assets, package manifests and lockfiles, build configuration, README, `AGENTS.md`, `CLAUDE.md`, and the Obsidian Markdown notes tracked. Blanket exclusion of documentation or all dotfiles was not adopted because it would hide shared project instructions and useful configuration.

This removes local settings from the current GitHub tree, not from existing commit history.
