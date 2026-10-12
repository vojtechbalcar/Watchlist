---
type: decision
updated: 2026-10-12
status: current
---

# Mobbin landing design

Related: [[landing-hero]], [[landing-page-design]], [[landing-entry-routing]], [[CLAUDE-hard-rules]]

On 12 October 2026 the user asked for the landing page to be rebuilt from Mobbin's design language. `npx getdesign@latest add mobbin` installed it as `DESIGN.md` at the repo root. The user first mentioned connecting "the MCP", then said the MCP was not needed: "just use the design.md from mobbin". getdesign has no MCP of its own. Mobbin's official MCP (`https://api.mobbin.com/mcp`) needs a browser OAuth sign-in, and it was not set up.

`DESIGN.md` applies to `/landing` only. The signed-in app keeps [[neutral-page-design]].

## How Watchlist adapts Mobbin

- **Palette.** Ink `#141414` on white, with the neutral tint ladder (`#f3f3f3`, `#f0f0f0`, `#e0e0e0`) instead of shadows. The tokens are scoped to `.page` in `src/app/landing/landing.module.css`.
- **Accent.** Mobbin's one accent, electric blue, is replaced by Watchlist maroon. It appears only on the wordmark and the terminal periods of the hero and closing headlines. Primary actions are ink pills, as Mobbin specifies; maroon never marks a button, a gain or a loss.
- **Content colours.** Green and red stay market direction only. In Mobbin's terms they are the content that supplies the colour.
- **Type.** Saans is commercial. Helvetica Neue stands in for it (it is in DESIGN.md's own fallback stack): Bold 700 for headings, Medium 500 for labels and links, Light 300 for lead paragraphs. Letter-spacing is zero. The Light cut is declared in `src/app/landing/layout.tsx` so only `/landing` preloads it. `next/font/local` throws outside Next's compiler, and `tests/landing-entry.test.mjs` renders the page in plain Node, so the font cannot live in `page.tsx`.
- **Shapes.** Every control is a stadium pill (`src/components/landing-buttons.module.css`). Containers have 24px corners, media tiles 16px, and company tiles 30% squircles.
- **Structure.** Sections are centred lockups separated by space, not rules. Uppercase tracked eyebrows are gone; DESIGN.md forbids all-caps and tracking.

## Page, top to bottom

1. A floating, sticky nav pill: wordmark, The app, Source code, Sign in, and an ink "Go to watchlist" pill.
2. The orbit hero described in [[landing-hero]].
3. A two-tone statement in place of the large return equation. It reads "A return is only half the story." in ink, then the explanation in grey.
4. The product tour, with a segmented control for its four views and each view in a soft 24px panel. The previous/next arrows and counter were removed, since the control already does that job. Keyboard arrows, Home/End and swipe remain.
5. Three numbered steps on squircle tiles, and the closing CTA.
6. A compact soft footer card that mirrors the nav pill. It has the brand, three link groups (On this page, Account, Project), and notes on illustrative data and logo trademarks. "Create an account" carries the setup entry as its `callbackUrl` (see [[landing-entry-routing]]). Without it, registration lands on the dashboard.

All seven watchlist CTAs still use `WatchlistEntryLink`.

## User corrections, in order

- The race hero: "no i dont like the race hero idea go a different more of a ilustration route like make it breathe more and be more vissually appealing even if it doesnt comunicate its message as good". Visual appeal now outranks how literally the hero explains the benchmark.
- The first orbit hero's solid ink S&P 500 semicircle "feels a bit bland". It became the fan of monthly petals described in [[landing-hero]].
- The large returns under the hero (+18.7% − +22.1% = −3.4 pp) did not "fit the minimalistic vibe". They were replaced with the SaaS-style two-tone statement.
- The first footer, a tall ink band, was "too big and not enough happens in it and it kinda breaks the flow". It became the compact soft card above.

## Considered and not used

These were implementation choices, not the user's, and can be revisited:

- Inter, DESIGN.md's suggested Saans substitute. It would have split the landing page's typeface from the app's Helvetica.
- Maroon pill CTAs. Mobbin keeps every primary action in ink, and maroon is easier to keep brand-only as a single accent.
- Mobbin's own full-bleed ink footer. This was tried first, and the user's footer correction above rules out a dark slab at the end of the page.
- Company wordmarks (Costco, ExxonMobil) as orbit tiles; they are unreadable at tile size.

## Verification

TypeScript, scoped ESLint, all 120 Node tests (`node --experimental-strip-types --test tests/*.test.mjs`) and a Webpack production build pass. `/landing` still prerenders as static, and only `/landing` preloads the Light font. In Chrome, checked at 1990 × 1040, 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844 and 320 × 667: no horizontal overflow, no hero tile over the copy, and every phone tile inside the viewport. With reduced motion nothing animates and the finished illustration shows. The tour tabs pass arrow, Home/End and wrap-around checks, with a visible ink focus ring.

The production build ran in a temporary copy of the repo. Another session's `next start` was serving the repo's own `.next` on port 3100, and building there would have replaced its files.
