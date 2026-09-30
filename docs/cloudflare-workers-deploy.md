---
type: troubleshooting
updated: 2026-09-30
status: current
---

# Deploying to Cloudflare Workers

Related: [[account-pages]], [[prisma-build-without-database]], [[postgres-prices]]

The repo deploys through Cloudflare Workers Builds: build command `pnpm run build`, deploy command `npx wrangler deploy`. `build` runs `opennextjs-cloudflare build`, which runs `next build` itself (set as `buildCommand` in `open-next.config.ts` so it doesn't call `pnpm run build` back); `build:next` is the plain Next build. The Worker runs the Next.js app through the OpenNext Cloudflare adapter.

## Symptom

After [[account-pages]] added Auth.js and the first runtime Prisma queries, the deploy failed while bundling:

```
✘ [ERROR] Could not resolve "pg-cloudflare"
  .open-next/server-functions/default/node_modules/pg/lib/stream.js
  The module "./dist/index.js" was not found on the file system
```

## Causes (four layers, each hidden behind the previous one)

1. **No Wrangler config in the repo.** `wrangler deploy` auto-configured OpenNext during every build, so nothing was under our control.
2. **`pg-cloudflare` exposes its socket only under the `workerd` export condition.** Next's file tracing follows the Node condition, copied only `dist/empty.js`, and OpenNext's workerd bundle couldn't find `dist/index.js`.
3. **The proxy imported the database.** `src/proxy.ts` re-exported `auth` from `src/auth.ts`, which pulled Prisma and `pg` (ESM externals) into the proxy. Turbopack then made the proxy an async module whose export is a Promise; OpenNext's `__toESM` wrapper turns that into a fake Promise, so every page returned 500 with `Method Promise.prototype.then called on incompatible receiver`.
4. **Prisma's query compiler was compiled from base64.** The `prisma-client` generator (nodejs runtime) calls `new WebAssembly.Module(bytes)`, which Workers forbid: `Wasm code generation disallowed by embedder`.

## Fix

- Commit `wrangler.jsonc` (`nodejs_compat`, assets) and `open-next.config.ts`, and make `pnpm run build` produce `.open-next`. Next.js went from 16.3.4 to 16.3.7 because OpenNext 1.20 requires ≥16.3.6.
- `serverExternalPackages: ["@prisma/client", ".prisma/client", "pg", "pg-cloudflare"]` in `next.config.ts`, so OpenNext resolves their `workerd` builds.
- Split Auth.js: `src/auth.config.ts` holds the database-free settings and the `authorized` gate; `src/proxy.ts` builds from it alone; `src/auth.ts` adds the Credentials provider.
- Switch the Prisma generator to `prisma-client-js` with its default output. Its package has a `workerd` entry that imports the query compiler as a real `.wasm` module. Import from `@prisma/client`.
- `getDb()` in `src/lib/db.ts` creates a client per request (React `cache`, `maxUses: 1`): Workers can't reuse a connection across requests, so there is no process-wide pool.
- `trustHost: true`: off Vercel, Auth.js otherwise rejects the host.

Rejected: `runtime = "workerd"` on the new generator. It loads the wasm with `import("./…wasm?module")`, which Next can't compile, so it would break `next dev` and the Node build. Also rejected: Edge-runtime middleware (deprecated) and dropping the proxy (the market layout can't build `callbackUrl` without the path).

## Follow-up: "Could not find compiled Open Next config"

The next deploy failed in the deploy step. Once `open-next.config.ts` exists, `wrangler deploy` skips its own build and hands off to `opennextjs-cloudflare deploy`, which needs `.open-next` from the build step. My first attempt put the OpenNext build in a Wrangler `build.command` (`--skipNextBuild`), which never ran on that path. `--skipNextBuild` also can't reuse a plain `next build`: OpenNext enables standalone output when it runs the Next build itself, and without that the build is missing files like `middleware.js.nft.json`. Note that `wrangler deploy --dry-run` skips the hand-off; test that step with `OPEN_NEXT_DEPLOY=true opennextjs-cloudflare deploy --dry-run`.

The Worker upload is about 3.9 MB gzipped (the Next server bundle plus Prisma's query-compiler wasm). That is over the Workers Free limit of 3 MB and within the Paid limit of 10 MB.

## Tried first

- Only adding `pg`/`pg-cloudflare` to `serverExternalPackages`: the build passed, but pages returned 500 (cause 3), then queries failed (cause 4).
- `export const { auth: proxy } = NextAuth(...)`: Next's static check doesn't recognise a destructured proxy export. Use `export default NextAuth(authConfig).auth`.

## Local testing gotcha

`wrangler dev` over plain http doesn't send `x-forwarded-proto`, and Auth.js then assumes `https` in the proxy and looks for the `__Secure-` session cookie, while the route handler sets the unprefixed one. Signed-in requests look signed out. Put `AUTH_URL=http://localhost:8787` in `.dev.vars`. Production is https on both sides, so it needs no `AUTH_URL`.

The Worker needs `DATABASE_URL` and `AUTH_SECRET` set as Cloudflare secrets.

## Verification

In local workerd (`wrangler dev` on the OpenNext build) against Prisma Postgres: signed-out redirects, wrong password rejected, case-insensitive login, session carries the user id, all market pages load signed in, Settings shows the email, `/login` redirects signed-in users. `next start` on Node passed the same login checks. Typecheck, ESLint, and `tests/prisma-generate.test.mjs` pass. Locally `pnpm` fails through corepack, so the checks used a shim running `npx pnpm@10.11.1`.
