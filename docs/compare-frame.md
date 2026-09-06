---
name: compare-frame
description: "How the /compare page was built from the Figma frame — the derived-numbers rule for the comparison matrix, the series colour palette, and the one placeholder gap left open."
metadata: 
  node_type: memory
  type: project
  originSessionId: f29f9f85-1bcb-41d4-b1c6-5a3e58939d21
  modified: 2026-09-04T19:43:12.537Z
---

> [!info] Historical frame — superseded 2026-09-06
> See [[neutral-page-design]] for the current chart/sidebar/table layout. The current chart changes with the selected range using illustrative history normalized to demo returns; the static-geometry limitation below no longer describes the rendered chart. The three-stock pool, fixed benchmark, and derived percentage-point matrix remain. The table now lives in `compare-view.tsx`; `full-comparison-table.tsx` is legacy. Series colors are now ink, muted taupe, and slate.

The `/compare` route was built on 2026-09-04 from Figma frame
**Dashboard – compare** (node `97:212`) in file `3bxSmnFWXAAfBGTudWLAUV`.
Same approach as [[watchlist-table-frame]] and [[design-tokens-from-figma]].

Files: `src/lib/compare-data.ts`, `compare-view.tsx` (state),
`compare-chart.tsx`, `full-comparison-table.tsx`.

## One number, typed once

Everything on the page derives from `returnByRange` — a return per stock per
range — plus the benchmark's own return. A **gap is a difference of returns in
percentage points**, which is exactly how the design reads its vs-benchmark
column: NVDA +42.00 against a benchmark of +14.60 is quoted as +27.40, and the
same holds for MSFT and AMZN. Applying that rule to the peer columns makes the
matrix antisymmetric for free: A vs B is always exactly -(B vs A).

**The mock's own matrix is not self-consistent** — it prints NVDA vs MSFT as
+25.80 where the difference rule gives +26.10, and its MSFT callout says +1.59%
where its table says +1.30%. The derived numbers ship; two of the three peer
pairs match the mock exactly anyway.

## Series colours are identity, not judgement

New `--color-series-*` tokens: ink, rust `#94502d`, teal `#3e5f4f`, plus a
`--color-series-benchmark` grey for the dashed line. They say *which stock* a
line belongs to and carry no opinion about direction — green, red and maroon
stay reserved for direction and brand, per [[CLAUDE-hard-rules]]. Each stock
owns its colour in `compare-data.ts` (`colorVar`), so its line, pill dot and
table dot can never disagree, even after another stock is removed.

Maroon does appear twice here, both as brand: the `VS S&P 500` column header
and the `NVDA VS S&P 500` callout labels. It marks *the benchmark pairing* —
the app's whole premise — never a gain or a loss.

## Known placeholder gap

`path` on each series is the exact Figma curve and **does not vary by range**,
so switching 1D/1W/1M/YTD/1Y moves every number while the lines stay put. This
is written down in `compare-data.ts` too. Per-range geometry gets generated
once price history is in Postgres — see [[watchlist-placeholder-data]].

## Scope calls

- **The addable pool is the three stocks that have series geometry.** A stock
  with no curve cannot be charted, so the picker offers exactly those.
- **The benchmark is fixed.** The mock ships one index and every figure on the
  page is defined against it, so the pill's × renders as designed but is
  disabled with a reason rather than being a control that breaks the page.
- **A callout per selected stock.** The frame draws only two for its three
  selections; rendering one each is the consistent read.
