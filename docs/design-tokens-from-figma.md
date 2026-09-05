---
name: design-tokens-from-figma
description: The app's visual language lives as Tailwind v4 tokens in globals.css, derived from the Figma dashboard frame; brand/direction colour rules are encoded in token names.
metadata:
  type: project
---

The design system is a single `@theme` block in `src/app/globals.css`, derived
from the Figma file `3bxSmnFWXAAfBGTudWLAUV`, frame **Dashboard – overview**
(node `64:1444`) on 2026-09-04.

The two colour rules from [[CLAUDE-hard-rules]] are encoded in the token
*names*, so the right choice is the obvious one:

- `--color-brand` (maroon `#a63d57`) — wordmark underline and active nav only.
- `--color-ink` (`#241f21`) — the wordmark's mark and primary text.
- `--color-up` / `--color-down` — market direction only, never brand.

Two font roles, not one: `--font-sans` (Helvetica Neue) carries structure —
headings, nav, labels. `--font-data` (Poppins) carries every number. This split
is deliberate in the design, not incidental.

**Rejected:** shipping the React that Figma's MCP emits. It is absolutely
positioned against a fixed 1920x1080 canvas with hardcoded hex values, so it
cannot reflow and defeats the point of a token layer. Components were rebuilt
as flow/flex against the tokens instead.

**Also rejected:** the exported `gridLanding.svg` background. It is a plain
120x120 rule grid at 1% opacity, reproduced exactly with
`repeating-linear-gradient` so it tiles to any page height rather than being
locked to the artboard.

Chart and sparkline geometry are the exact vectors from Figma, inlined in
`performance-chart.tsx` and `sparkline.tsx`. They are placeholders — see
[[watchlist-placeholder-data]].

**One token gap, on purpose:** the wordmark renders from
`public/WachlistHeaderLogo.svg` (paths, no live text, so no font dependency).
Its maroon and washed black are baked into that file rather than read from
`--color-brand` / `--color-ink`. Moving the brand colour therefore means
re-exporting the logo from Figma, not just editing a token.
