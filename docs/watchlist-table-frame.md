---
name: watchlist-table-frame
description: "How the /watchlist table page was built from the Figma frame, and the three judgement calls made where the mock and the app data disagreed."
metadata: 
  node_type: memory
  type: project
  originSessionId: f29f9f85-1bcb-41d4-b1c6-5a3e58939d21
  modified: 2026-09-04T19:30:30.078Z
---

> [!info] Historical frame — superseded 2026-09-06
> See [[neutral-page-design]] for the current compact table shared by Dashboard and Watchlist. The seven-stock source and local removal remain. Search, Ahead/Behind filters, sortable columns, day changes, and benchmark gap bars replace the old framed table and 30-day sparklines below. The current table starts in source order rather than ranking by benchmark gap.

The `/watchlist` route (`src/app/watchlist/page.tsx` + `watchlist-table.tsx`)
was built on 2026-09-04 from Figma frame **Dashboard – watchlist**
(node `89:4309`) in file `3bxSmnFWXAAfBGTudWLAUV`, following the same rules as
[[design-tokens-from-figma]].

## Three calls where the mock and the app disagreed

**The mock's tickers were not adopted.** The frame lists NVDA, UNH, COST, AAPL,
MSFT, JPM; the app's `holdings` array lists a different seven. Kept the existing
array as the single source, because it is the one seam to Postgres
([[watchlist-placeholder-data]]) and the dashboard already renders it. The
frame's own copy — "7 holdings · 4 beating the market" — comes out exactly right
against the existing data, so the mock's numbers are computed, never typed.

**The frame's active nav is "Compare" on a Watchlist page.** Read as a slip in
the mock; the page ships with `active="Watchlist"`.

**The 30-day sparkline follows vs-market, not the intraday move.** In the frame
MSFT is green for the day but its 30-day shape is red, and red is exactly the
set of rows lagging the benchmark. Encoded that way in `trend-line.tsx`.

## Shape of the build

- A real `<table>`, not a grid of divs — column headers and row headers come
  free, and the 30-day column drops out under `lg` with `hidden lg:table-cell`.
- Search and the row remove control are live, not decorative: the frame ships
  the hover state (tinted row, filled remove button), so wiring it was the
  honest reading. Removal is local state only — nothing is persisted.
- `trend-line.tsx` is one geometry mirrored with `scale-x-[-1]`, because Figma
  draws the falling variant as the rising one flipped. Same trick, one path.
- New tokens this frame introduced: `--color-brand-foreground`,
  `--color-up-deep`, `--color-down-surface`, `--color-surface-row-hover`,
  `--text-ticker`, and a `--color-remove-*` group. The remove control's rust
  `#b04735` is neither brand nor market direction, so it got its own name
  rather than borrowing maroon — see [[CLAUDE-hard-rules]].

**Rejected:** hiding the remove button entirely until hover. It renders as a
faint dash (`--color-remove-idle`) at rest so the affordance survives keyboard
and touch, which a pure `group-hover` reveal would not.
