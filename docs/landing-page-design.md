---
type: decision
updated: 2026-09-09
status: current
---

# Landing page design

Related: [[landing-hero]], [[neutral-page-design]], [[watchlist-placeholder-data]], [[git-commit-workflow]]

## User correction

The user rejected literal app screenshots in the landing carousel: they lose the app's minimalistic feel and subtract more than they add. The user expanded the scope to a full landing-page redesign, with creative freedom to implement a complete version and revise afterward. After seeing the developing page, they said the design looked reasonable and reiterated that every screenshot must be replaced.

The user then explicitly corrected the hero change: keep the original three cards, including the dark CTA card, exactly as before. Broad creative direction for the rest of the landing page is not permission to replace this approved hero. The original header, hero markup, illustration, comparison graph, CTA, and responsive card styling are restored. Future revisions should concentrate below it unless the user specifically requests a hero change.

Use simplified, purpose-built product illustrations. Do not show full app captures, browser chrome, or tiny replicas of every control. Keep previews readable and focus each on one idea: benchmark context, a stock's relative return, comparing stocks, or finding companies.

## Design direction

Preserve the approved three-card hero and its original header. Continue below it with a short benchmark explanation, a four-view product explorer, three simple getting-started steps, a final account CTA, and a restrained footer. Keep Helvetica, neutral surfaces, thin rules, and maroon brand accents.

Product exploration uses manual tabs with keyboard navigation and simplified HTML/SVG illustrations. No autoplay, app screenshots, or embedded application pages. The site remains a Server Component with only the product explorer using client state.

Market figures and illustrative chart shapes come from the existing demo modules. Illustrations are explicitly labeled; they make no live-data claims or new price/API requests. All account creation links continue to `/register`; sign-in links go to `/login`.

Rejected: the literal screenshot carousel, tiny full-screen app replicas, multiple dense dashboard panels, and replacing the three-card hero with a two-column hero. The simplified preview UI is a labeled illustration; only the surrounding product-tour controls are interactive.

## Implementation and verification plan

- [x] Restore the original three-card hero; add the benchmark explanation, getting-started steps, final CTA, and footer below it.
- [x] Replace every screenshot with a simplified HTML/SVG product illustration and remove the generated screenshot assets.
- [x] Verify desktop/tablet/mobile layout, product tabs, keyboard navigation, reduced motion, links, and absence of screenshot requests.
- [x] Run typecheck, scoped lint, and a production build; inspect the diff.

## Verification

TypeScript, scoped ESLint, and the Webpack production build pass. Browser checks at 1990, 1440, 1024, 800, 760, 390, and 320 pixels wide confirm one main landmark, all three original hero cards, the original registration CTA, no page or illustration overflow, and equal panel heights for every product selection. Tabs, arrow wraparound, Home/End and arrow-key focus, reduced motion, internal anchor targets, and keyboard activation of the original CTA pass. Native touch swipes change previews; vertical scrolling does not. No browser errors or screenshot requests were observed.

The header and hero contents match the previous committed markup. The hero grid now sits inside the main landmark with the lower sections; its viewport-based minimum height preserves the previous first-screen sizing. The screenshot files from the rejected draft were removed entirely. The Dashboard and Compare illustrations use the same illustrative YTD benchmark, and the Dashboard gap is derived from the shown returns.
