---
type: decision
updated: 2026-09-23
status: current
---

# Stock table navigation and icon refinement

Related: [[explore-stock-details]], [[watchlist-table-frame]], [[watchlist-comparisons]], [[neutral-page-design]], [[undo-stock-removal]]

## User direction

After the Explore detail pages shipped, the user asked for better icons and a way to open stock details wherever stocks appear in a table.

## Navigation

The shared `StockLink` component makes the company cell a real Next.js link: logo, ticker, company name, and a small diagonal arrow. It is used by the Dashboard and Watchlist table, Compare’s side-by-side table and ranking list, and the older full comparison table.

The link supports keyboard activation, ordinary browser back navigation, and opening a new tab. Sorting, removal, undo, and comparison selection retain independent controls. Rejected: attaching navigation to an entire table row with a JavaScript click handler, which complicates native link behavior and risks making row controls navigate.

## Icons

Every one of the 48 Explore companies now has a cached SVG, with Tesla retained for the older catalog (49 assets total). Additional artwork comes from the public ticker-logos collection, which credits Finnhub. JPM uses the Chase symbol from Simple Icons. Exact sources are documented in `public/logos/symbols/README.md`; no quote API or render-time logo service is involved.

Colored background paths are removed and the foreground is normalized to black. The viewBox trims unused space. Pfizer and Simon use their symbols without the adjacent wordmarks. Home Depot’s inner background and Costco’s outline needed separate removal; simply turning every path black initially obscured the marks.

Shared logo sizing now adjusts for visual weight: dense marks have more padding, while wide marks get more room. The percentage sizing scales with the existing tile sizes in cards, tables, rankings, setup, and stock details. Borders are softer. Unknown future companies retain the neutral outline fallback.

Rejected: leaving the missing half of the catalog as repeated generic buildings, keeping colored square backgrounds, or using one fixed pixel size for every logo shape.

## Verification

Typecheck, ESLint on affected components, and the production build passed. Browser checks covered all three live stock tables, Compare’s ranking links, keyboard and mobile navigation, table sorting, removal and undo, independent comparison selection, loading every visible Explore logo as a black SVG, and absence of runtime errors. Desktop, mobile, and the complete SVG contact sheet were visually inspected.
