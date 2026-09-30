---
type: decision
updated: 2026-09-30
status: current
---

# Generate Prisma without database credentials

Related: [[postgres-prices]], [[git-commit-workflow]]

The deployment failed during `pnpm install --frozen-lockfile`: the root
`postinstall` ran `prisma generate`, but loading `prisma.config.ts` threw
`PrismaConfigEnvError` because `env("DATABASE_URL")` requires a value immediately.
The build environment had neither that variable nor local environment files.

Use `process.env.DATABASE_URL` in the Prisma config. Prisma 7.10 allows the URL
to be absent for client generation and validates it for commands that need
Postgres. Keep `.env.local` / `.env` loading and the generation hook intact.
Database credentials are still required for database operations.

Rejected: disabling `postinstall`, which could leave the generated client
missing; inventing a fallback database URL; requiring database credentials
just to generate types. This follows the [Prisma config reference](https://docs.prisma.io/docs/orm/v7/reference/prisma-config-reference#handling-optional-environment-variables).

## Verification

- `node --test tests/prisma-generate.test.mjs` reproduced the exact error before
  the fix and passed afterward. It runs the installed Prisma CLI in a temporary
  fixture without local environment files or an inherited `DATABASE_URL`.
- The real `postinstall` script and `next build --webpack` passed in a separate
  credential-free copy; all 68 pages generated.
- `prisma migrate status` still rejected the missing `datasource.url`.
- Typecheck and scoped ESLint passed. Local Corepack could not verify the current
  pnpm signing key, so these scripts ran through npm / the installed binaries.
