---
name: explore-frame
description: "How the /explore page was built from the Figma frame — the sector-index rule that makes \"measured against the market\" mean something, and the hero slot's honest empty case."
metadata: 
  node_type: memory
  type: project
  originSessionId: f29f9f85-1bcb-41d4-b1c6-5a3e58939d21
  modified: 2026-09-04T20:02:11.363Z
---

> [!info] Historical frame — superseded 2026-09-06
> See [[neutral-page-design]] for the current summary-and-table layout. Sector selection now uses a dropdown containing all nine sectors; the large hero, card grid, More pills, and featured-card layout below are historical. The live route uses `explore-view.tsx` and shared `stock-logo.tsx`; the old card/chart components remain unused. Sector benchmarks and local-only membership still apply.

The `/explore` route was built on 2026-09-04 from Figma frame
**Dashboard – explore** (node `101:711`) in file `3bxSmnFWXAAfBGTudWLAUV`.
Same approach as [[watchlist-table-frame]] and [[compare-frame]].

Files: `src/lib/explore-data.ts`, `explore-view.tsx` (state),
`explore-card.tsx`, `explore-hero-chart.tsx`.

## Every stock is judged against its own sector

The page's subtitle is "measured against the market", and the design proves
what it means: NVDA reads *vs SOXX*, GOOGL reads *vs NASDAQ*. So the benchmark
is a property of the sector, not of the stock — `sectorBenchmarks` maps each
sector to one index (Technology→NASDAQ, Semiconductors→SOXX, Healthcare→XLV,
and so on). Nothing is typed twice: the "N of M beating their market" line and
the hero stock are both computed from the universe.

**The mock breaks its own rule** in two places — it labels AVGO *vs NASDAQ*
next to NVDA's *vs SOXX*, and UNH *vs S&P 500* rather than a healthcare index.
The sector map ships; a semiconductor is judged against semiconductors.

## The hero slot has an empty case the mock never shows

The hero promotes the biggest lead over its own index. Filter to **Energy**,
where nothing is ahead, and "BIGGEST MARKET-BEATER TODAY" would be a lie — so
the label switches to "CLOSEST TO ITS MARKET TODAY" and the hero chart turns
red. Found by filtering; the frame only ever shows the happy path.

## Scope calls

- **Watchlist membership is derived**, not stored twice: a card shows the check
  tile when its ticker is in `holdings`. The design's own check states don't
  match its data (it checks UNH, which is not on the watchlist, and offers to
  add GOOGL, which is). Toggling is local state only.
- **"More" genuinely reveals more.** It expands the pill row to three sectors
  that have listings — Industrials, Utilities, Real Estate — rather than being
  a decorative pill. That is why the count reads 22, not the mock's 18.
- **`featured` is an editorial flag**, not derived. The design gives exactly one
  card in the grid a double-width slot; nothing in the data implies which.
- **The card sparkline uses this frame's own geometry**, not the shared
  `Sparkline` from [[design-tokens-from-figma]]. That one descends left to
  right, which read as contradictory under a green +2.44%. One path mirrored
  with `scale-y-[-1]` for the falling case, same trick as `trend-line.tsx`.

New tokens: a `--color-filter-*` group for the sector pills and
`--color-added-*` for the membership tile. The check's deep red `#7b2d3b` is an
ownership badge, not a gain or a loss — its own name, per [[CLAUDE-hard-rules]].
Maroon appears on `vs <INDEX>` labels as brand, marking the benchmark pairing.
