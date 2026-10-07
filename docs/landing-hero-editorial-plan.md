---
type: plan
updated: 2026-10-07
status: superseded
---

# Editorial hero implementation plan

> Superseded 7 October 2026: the user rejected panelled heroes altogether. See the open hero in [[landing-hero]].

Related: [[landing-hero]], [[landing-page-design]], [[git-commit-workflow]]

**Goal:** Build the approved full-width editorial hero with a linked market reveal.

**Architecture:** Isolate hero state and styles in `src/components/landing-hero.tsx` and `landing-hero.module.css`. Keep `src/app/landing/page.tsx` a Server Component; replace only its hero. Reuse `src/lib/landing-comparison.ts` for illustrative returns and the derived gap. No new dependencies, network requests, or persistence.

**Tech stack:** Next.js 16, React 19, TypeScript, CSS Modules.

- [ ] Implement `LandingHero` with a native reveal button, `aria-expanded`, `aria-controls`, and a polite announcement. Preserve the headline and CTA destinations. Show both returns on a shared zero-based scale; hide the benchmark and gap until reveal.
- [ ] Build square, contiguous full-width panels in `landing-hero.module.css`. Keep Helvetica and brand tokens. Animate only transform/opacity; disable animation under reduced motion. Put the mobile control before the return graphic.
- [ ] Replace the old hero in `src/app/landing/page.tsx`. Remove superseded hero CSS from `landing.module.css` and the unused illustration/chart components after checking references. Preserve lower sections and header styling.
- [ ] Run `npm run typecheck`, scoped ESLint, and `npm run build:next -- --webpack` (pnpm is unavailable in this shell). Preview desktop and narrow mobile widths; verify reveal/reversal, keyboard focus/activation, both CTA routes, stable panel sizes, and no horizontal overflow.
- [ ] Review the diff, record observed verification in [[landing-hero]], commit the coherent implementation and notes, and push the current branch without force.
