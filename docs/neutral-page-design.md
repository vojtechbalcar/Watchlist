---
type: decision
updated: 2026-09-11
status: current
---

# Neutral page design

> [!info] Explore update — 2026-09-11
> The user replaced Explore’s summary-and-table layout with four-card sector rows and dedicated category pages, and explicitly removed the hero/highlights. See [[explore-sector-pages]]. The neutral palette, typography, and compact page structure still apply; the earlier rejection of cards is superseded for Explore.

Related: [[design-tokens-from-figma]], [[compare-frame]], [[explore-frame]], [[watchlist-table-frame]]

The restored dashboard screenshots define the shared visual language: neutral light gray background, compact Helvetica typography, thin horizontal rules, restrained maroon brand accents, and muted market-direction colors. Sections sit directly on the page instead of raised rounded cards.

The user approved Dashboard and Watchlist, then corrected Compare and Explore: changing only colors did not carry the design through. Compare now uses a chart with compact metrics, a ranking sidebar, and a comparison table. Explore uses a three-part market summary and a filterable stock table instead of a large hero and card grid. Future changes must follow the layout and information hierarchy, not just the palette.

Data remains illustrative. Explore membership is local component state, as before. Compare chart geometry is now illustrative normalized history that follows each selected range's return; it is not historical market data.

## Current implementation

- All routes share a light neutral background (`#f6f7f8`), local Helvetica Neue for labels and numbers, compact headings, and a snapshot footer. Poppins is no longer loaded.
- Dashboard uses a chart with three headline figures and a market-summary sidebar. Its stock table is shared with Watchlist.
- Watchlist offers search, Ahead/Behind filters, sortable columns, and local removal. Benchmark gaps use percentage points and centered bars rather than decorative sparklines.
- Compare uses compact selection chips, range controls, chart metrics, a ranking sidebar, and a side-by-side matrix. Removing and re-adding the three supported stocks works; the final stock cannot be removed.
- Explore uses stacked sector rows with four-card previews and dedicated category pages. Cards emphasize company identity, price, daily move, and benchmark gap; the hero and highlights are removed. See [[explore-sector-pages]].
- On small screens, summaries stack and tables scroll within their own containers. Positioning the scroll container relatively keeps the screen-reader caption from extending the page width.

## Rejected

The beige palette, raised rounded cards, oversized hero blocks, and a color-only restyle of Compare and Explore were rejected. Layout, density, and information hierarchy must match the approved Dashboard and Watchlist, not merely their colors.

See [[checkpoint-2026-09-06]] for verification and remaining limitations, and [[git-commit-workflow]] for the user's commit preference.
