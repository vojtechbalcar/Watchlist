---
type: preference
updated: 2026-09-07
status: current
---

# Git commit workflow

The user requested regular commits after every change following concern that the earlier redesign had not been pushed to Git.

Commit each completed, verified, coherent change as it is finished. Do not accumulate a session's finished work in the working tree. Use descriptive messages, review the staged diff, and run checks proportionate to the change. Documentation-only changes need content/link and diff checks; application changes need relevant build, type, lint, or interaction checks.

Update this Obsidian vault after corrections and product/architecture decisions, including what was rejected, per `AGENTS.md`. Commit the notes as well. Preserve unrelated user work and stage only the intended files.

Automatically push every completed, verified commit to GitHub on the current branch. Set the upstream when needed and verify the push succeeded before reporting completion. Do not wait for a separate push request, and never force-push without explicit authorization. This standing authorization is recorded in `AGENTS.md` and mirrored in `CLAUDE.md`.

On 2026-09-07, the user corrected the earlier local-only workflow after [[account-pages]]: committing and pushing must happen automatically for future verified changes, not just that one change. The previous rule requiring a separate push request was rejected and superseded.

The completed redesign was saved in `a67a2e9`. See [[neutral-page-design]] and [[checkpoint-2026-09-06]].
