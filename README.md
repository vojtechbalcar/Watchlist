# Watchlist

**Is a stock beating its benchmark, or just moving with it?**

Watchlist puts stock performance in context. Follow stocks, explore sectors, and compare returns against a benchmark in a compact, responsive interface.

## Current status

This is a working UI demo. All prices, returns, and chart histories are illustrative; they do not represent a synchronized live market snapshot.

Watchlist membership is saved in this browser and synchronized across pages and tabs. New visitors can use a three-step setup flow or explore stocks directly. Login and registration are UI previews with form validation; they do not create accounts or authenticate users. No database or stock API setup is required to run the demo.

## Pages

| Page | Route | What it does |
| --- | --- | --- |
| Dashboard | `/` | Market summary, illustrative performance chart with range controls, and a stock watchlist. |
| Watchlist | `/watchlist` | Search, filter, sort, and remove demo stocks; view their performance against a benchmark. |
| Compare | `/compare` | Choose up to three saved stocks and compare their shared period returns against the S&P 500 and each other. Includes chart, rankings, and empty states. |
| Explore | `/explore` | Browse demo stocks by sector, search and filter results, and toggle local watchlist membership. |
| Log in | `/login` | Email/password form with password visibility controls and a link to registration. |
| Register | `/register` | Account form with email and password validation, plus a link back to login. |

## Run locally

Requires Node.js 20.9 or later and npm. The repository includes `package-lock.json` for reproducible installation.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables are needed for the current demo.

## Commands

```bash
npm run dev        # Development server
npm run typecheck  # TypeScript checks
npm run lint       # ESLint
npm run build      # Production build
npm start          # Serve the production build
```

The scripts can also be run with pnpm, including `pnpm dev` and `pnpm typecheck`.

If Turbopack cannot start its worker in a restricted environment, the production build can use Webpack:

```bash
npm run build -- --webpack
```

## Stack and structure

Next.js App Router, React, TypeScript, and Tailwind CSS. Typography uses locally bundled Helvetica Neue fonts. The shared visual style uses light gray surfaces, thin dividers, compact type, and restrained maroon brand accents.

```text
src/app/(market)/   Dashboard, Watchlist, Compare, Explore, and market footer
src/app/(auth)/     Login, registration, and shared account layout
src/app/globals.css Shared design tokens and styles
src/components/    Forms, charts, tables, navigation, and other UI
src/lib/           Demo datasets and formatting helpers
src/fonts/         Local font assets
public/            Wordmark and company logos
docs/             Project decisions, checkpoints, and Obsidian memory notes
```

Route groups organize layouts without changing public URLs. The stock catalog and period returns live in `src/lib/explore-data.ts` and `src/lib/explore-performance.ts`; Watchlist, Dashboard, and Compare share those figures through `src/lib/watchlist-catalog.ts`. The S&P 500 fixture lives in `src/lib/market-benchmark.ts`, while Explore uses sector benchmarks. `src/lib/watchlist-data.ts` retains market-summary and legacy preview fixtures. Chart paths remain illustrative.

Run the data, browser-state parsing, and comparison regression tests with Node.js 22.13 or later:

```bash
node --experimental-strip-types --test tests/*.test.mjs
```

## Next steps

- Connect authentication and Postgres.
- Sync the browser-saved watchlist to an account when authentication is connected.
- Add a cron job to ingest market data and replace demo charts with dated price histories.
- Calculate stock and benchmark returns over matching date ranges.

For the data integration, **all application price reads must come from Postgres. Only the cron job may call the stock API.**

## Project conventions

- Use “watchlist” consistently throughout the product.
- Maroon is reserved for branding; green and red communicate market direction.
- Keep local editor, assistant, and Obsidian settings out of Git. Project notes and shared instructions remain tracked.
- Commit and push each completed, verified change, preserving unrelated work.

See [AGENTS.md](AGENTS.md) for development instructions and [docs/MEMORY.md](docs/MEMORY.md) for the project memory index.
