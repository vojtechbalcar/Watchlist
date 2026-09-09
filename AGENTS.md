# Watchlist

Next.js app answering one question: is a stock beating its benchmark,
or just moving with it?

## Commands
- Dev: `pnpm dev`
- Typecheck: `pnpm typecheck`

## Hard rules
- Price data comes from Postgres only. Only the cron job calls the stock API.
- Maroon is brand only, never gains or losses. Green/red are market direction only.
- The word is "watchlist", never "portfolio".

## Memory
Your memory files live in `docs/`, which is an Obsidian vault. Write them as
proper Obsidian notes: link related notes with [[wikilinks]], kebab-case
filenames.

Save a memory when:
- I correct you
- We make an architectural or product decision (include what we rejected)
- Something takes more than 30 minutes to solve (symptom, cause, fix, and what
  I tried first that didn't work)

When I say "checkpoint", save the current state: what works, what's broken,
what's next.

## Git workflow

- Commit after each completed, verified, coherent change; do not leave finished work uncommitted until the end of a session.
- Use focused commits and descriptive messages. Check the diff and run checks appropriate to the change before committing.
- Update the Obsidian notes when the memory rules above apply, and commit those updates too.
- Preserve unrelated user changes; stage only the files belonging to the change being committed.
- Automatically push each completed, verified commit to GitHub on the current branch after committing; do not wait for a separate push request. Set the upstream when needed, and verify the push succeeded before reporting completion. Never force-push without explicit authorization.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
