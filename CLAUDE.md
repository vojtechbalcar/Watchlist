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