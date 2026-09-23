---
type: decision
updated: 2026-09-23
status: current
---

# Explore stock details

Related: [[explore-sector-pages]], [[explore-period-comparisons]], [[neutral-page-design]], [[saved-watchlist]], [[undo-stock-removal]], [[postgres-prices]]

## User correction

Explore cards looked like entry points but had no stock detail destination. The user asked for an overview-style detail page with a graph and richer market comparisons, real black SVG logos (symbol-only wherever available), and removal of the demo-data footer.

## Implementation

- Every Explore card links to `/explore/stocks/[ticker]`. The link covers the card while add/remove and undo remain separate buttons. Sector cards share the same behavior.
- All 48 catalog stocks have generated detail pages and metadata. Tickers resolve case-insensitively; unknown tickers render the existing not-found screen. A matching loading skeleton covers navigation.
- Detail pages reuse the overview panel structure: identity and latest snapshot price, three period metrics, chart, comparison explanation, sector/benchmark facts, and a table of all five periods.
- The nested Explore layout retains the selected period across stock and sector navigation. Membership uses the shared browser watchlist, preserves undo ordering, and reports storage failures.
- The shared market footer and Explore’s bottom demo-data note were removed. Page padding now supplies the space formerly supplied by the footer.

## Data boundary

The current checkout still has fixture prices and returns. The Postgres schema exists, but the planned reader and cron integration described in [[postgres-prices]] are unfinished. No new prices or external price API calls were added. Details use the same period returns and sector benchmark as the cards.

The chart shows paired bars for the available period totals, with the selected period highlighted. It does not imply a historical price path. Rejected: scaling an invented zigzag to fixture endpoints or calling a market API from the page. A local chart caption identifies sample returns; removing the requested footer does not make the fixtures live data.

## Company symbols

`stock-logo.tsx` resolves a ticker through `stock-logos.ts` to a locally cached black SVG. The same component serves Explore, details, overview, watchlist, setup, and comparison components. The cache includes 24 real brand marks (23 current Explore companies plus Tesla from the older catalog). Assets and their source names are documented in `public/logos/symbols/README.md`.

Symbol-only versions are preferred; AMD’s original arrow is cropped from its combined source. Some brands only have wordmarks in this collection. Unavailable marks use a neutral building outline rather than fabricated brand initials. Adding a reviewed SVG and registering its ticker extends coverage without a render-time third-party dependency.

Rejected: colored raster logos, the Microsoft background-position crop, invented letter substitutes, and a live logo service requiring an attribution footer or paid self-hosting license.

## Investigation notes

The dead card was caused by the absence of both a link and detail route, not a failing click handler. The first SVG download sources were unreachable; the Iconify Simple Icons endpoint worked. Browser verification reused the existing local development server and cached Playwright Chromium after the named Chrome installation proved unavailable. Tests use actual anchor navigation and account for the sector heading’s existing CSS-generated punctuation.

Direct page loads exposed a hydration mismatch in SVG bar tooltips. A `<title>` containing separate JSX text fragments is parsed as one text node, which disagrees with the client’s fragment boundaries. Formatting each title as one complete string fixes it. Typecheck and build alone did not reveal this; browser reload/error checks did.

## Verification

`pnpm typecheck`, ESLint on changed code, all 39 existing tests, and `pnpm build --webpack` passed. The build generated all 48 stock detail routes. Browser checks covered stretched-card and keyboard navigation, separate membership buttons, sector return links, period continuity and arithmetic, saved membership and undo, reloads, SVG loading and black styling, narrow-screen width, equal/negative returns, lowercase tickers, and the not-found/noindex response. No browser runtime errors remained. Desktop and mobile screenshots were inspected; mobile chart labels were enlarged and the redundant Ahead/Behind table column is omitted so all numeric columns fit.
