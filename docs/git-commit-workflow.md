---
type: preference
updated: 2026-09-07
status: current
---

# Git commit workflow

The user requested regular commits after every change following concern that the earlier redesign had not been pushed to Git.

Commit each completed, verified, coherent change as it is finished. Do not accumulate a session's finished work in the working tree. Use descriptive messages, review the staged diff, and run checks proportionate to the change. Documentation-only changes need content/link and diff checks; application changes need relevant build, type, lint, or interaction checks.

Update this Obsidian vault after corrections and product/architecture decisions, including what was rejected, per `AGENTS.md`. Commit the notes as well. Preserve unrelated user work and stage only the intended files.

Local commits do not create a remote backup. Push when requested; the standing instruction here authorizes regular commits, not automatic pushes.

On 2026-09-07, the user clarified that the account-page change must also be pushed to GitHub. For this change, a local commit alone is insufficient; push to `origin/main` and verify the remote commit. See [[account-pages]].

The completed redesign was saved in `a67a2e9`. See [[neutral-page-design]] and [[checkpoint-2026-09-06]].
