# Watchlist

**Is a stock beating its benchmark, or just moving with it?**

Watchlist puts stock performance in context. Follow stocks, explore sectors, and compare returns against a benchmark in a compact, responsive interface.

## Current status

This is a working UI demo. All prices, returns, and chart histories are illustrative; they do not represent a synchronized live market snapshot.

Watchlist changes currently live in component state, reset on remount, and do not synchronize across pages. Login and registration are UI previews with form validation; they do not create accounts or authenticate users. No database or stock API setup is required to run the demo.

## Pages

| Page | Route | What it does |
| --- | --- | --- |
| Dashboard | `/` | Market summary, illustrative performance chart with range controls, and a stock watchlist. |
| Watchlist | `/watchlist` | Search, filter, sort, and remove demo stocks; view their performance against a benchmark. |
| Compare | `/compare` | Compare NVDA, MSFT, and AMZN with the S&P 500 using range controls, a chart, rankings, and a comparison table. |
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

Route groups organize layouts without changing public URLs. Demo data is defined in `src/lib/watchlist-data.ts`, `src/lib/compare-data.ts`, and `src/lib/explore-data.ts`; illustrative chart histories also live in chart components.

## Next steps

- Connect authentication and Postgres.
- Persist watchlist membership and synchronize it across pages.
- Add a cron job to ingest market data and replace demo charts with dated price histories.
- Calculate stock and benchmark returns over matching date ranges.

For the data integration, **all application price reads must come from Postgres. Only the cron job may call the stock API.**

## Project conventions

- Use “watchlist” consistently throughout the product.
- Maroon is reserved for branding; green and red communicate market direction.
- Keep local editor, assistant, and Obsidian settings out of Git. Project notes and shared instructions remain tracked.
- Commit and push each completed, verified change, preserving unrelated work.

See [AGENTS.md](AGENTS.md) for development instructions and [docs/MEMORY.md](docs/MEMORY.md) for the project memory index.
