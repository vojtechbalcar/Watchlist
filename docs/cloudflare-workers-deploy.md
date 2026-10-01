---
type: troubleshooting
updated: 2026-10-01
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

The Worker needs `DATABASE_URL`, `AUTH_SECRET`, `TWELVE_DATA_API_KEY`, and `CRON_SECRET` set as Cloudflare secrets. Since [[stock-search-and-price-schedule]], `main` is `custom-worker.ts`, which wraps `.open-next/worker.js` to add the Cron Trigger. Test the trigger locally with `wrangler dev --test-scheduled` and `curl 'http://localhost:8787/__scheduled?cron=*/5+*+*+*+*'`.

## Production runtime failures (2026-09-30)

Both appeared only in the deployed Worker. Everything in the verification
section below had passed, because all of it ran somewhere the deployed Worker
is not.

### Login redirected to a 500 with no message

`POST /login` answered with `x-action-redirect:
…/api/auth/callback/credentials?` — the bare callback URL, trailing `?` and no
query — and the browser's GET of it returned 500.

Cause: **`AUTH_SECRET` was never set as a Cloudflare secret.** Nothing in the
repo sets `secret`; next-auth reads `process.env.AUTH_SECRET` only. Missing, it
makes `assertConfig` return `MissingSecret`, and `@auth/core`'s `Auth()` handles
config errors *before* its `raw` check: for a non-HTML action like `callback` it
returns `Response.json({message}, {status:500})` and **throws nothing**.
`signIn` then reads `Location` off that response, gets null, and takes its
`responseUrl ?? url` fallback — redirecting to the callback URL it had just
built. Because nothing throws an `AuthError`, the `catch` in
`src/app/(auth)/actions.ts` never runs, so the user sees no error at all.

Reproduced exactly by driving `Auth()` the way `signIn` does, with and without
a secret: without it the fallback URL matched the production header byte for
byte. Fixed with `wrangler secret put AUTH_SECRET --name <worker>`.

Note the Worker serving the domain is **`gowatchlist`**, while `wrangler.jsonc`
says `watchlist`. `secret put` defaults to the config name, so it needs
`--name` or it writes to the wrong Worker. That mismatch is still unresolved.

### CallbackRouteError: cannot connect to the specified address

With the secret set, sign-in reached `authorize` and failed there:

```
[auth][cause]: Error: proxy request failed, cannot connect to the specified address
    at async F.performIO ... at async F.queryRaw
```

That string is in no package in `node_modules`: it is a workerd error, raised
when the Worker's outbound TCP `connect()` cannot be established. The query
never left the Worker.

Cause: **`@prisma/adapter-pg` opens a raw TCP socket, which a deployed Worker
cannot do to Prisma Postgres.** `wrangler dev` runs workerd on the host's
network, so TCP succeeded there, as it did under `next start` and for
`prisma migrate` — which is why every earlier check passed.

Fix: `src/lib/db.ts` uses `PrismaPostgresAdapter` from `@prisma/adapter-ppg`,
Prisma's serverless driver, which reaches the database over HTTP/WebSockets.
The connection string is unchanged — the driver sends it as a credential
instead of dialling it — so `DATABASE_URL` did not need resetting.
`prisma/seed.ts` and migrations keep `PrismaPg`; they run in Node, where TCP
works.

Prisma's example pairs that driver with the `prisma-client` generator at
`runtime = "workerd"`, which this repo rejected (see above). That turned out
not to be required: the existing `prisma-client-js` generator builds and
typechecks with the new adapter. After the swap the bundle contains no
`cloudflare:sockets` reference at all.

Tried first and rejected: removing `pg`/`pg-cloudflare` from
`serverExternalPackages` once the Worker stopped using them. Measured with
`OPEN_NEXT_DEPLOY=true opennextjs-cloudflare deploy --dry-run`, the upload was
3955.70 KiB gzipped against 3955.44 KiB before — noise. The entries are now
dead config but cost nothing, so the change was reverted to keep the fix
focused.

### Local builds hide missing secrets (2026-10-01)

OpenNext copies every `.env*` file, `.env.local` included, into `.open-next/cloudflare/next-env.mjs` at build time. So a locally built Worker always has `DATABASE_URL`, even when `.dev.vars` doesn't. Cloudflare's git build has no `.env.local`, so the deployed Worker gets only its own secrets. With no URL the old pg adapter dialled localhost and failed with the same `cannot connect to the specified address` `CallbackRouteError`. That makes a missing secret and the TCP problem above look identical in the logs; `getDb()` now names a missing variable. To test the way production runs, move `.env.local` aside, run `opennextjs-cloudflare build`, then `wrangler dev`.


## Verification

In local workerd (`wrangler dev` on the OpenNext build) against Prisma Postgres: signed-out redirects, wrong password rejected, case-insensitive login, session carries the user id, all market pages load signed in, Settings shows the email, `/login` redirects signed-in users. `next start` on Node passed the same login checks. Typecheck, ESLint, and `tests/prisma-generate.test.mjs` pass. Locally `pnpm` fails through corepack, so the checks used a shim running `npx pnpm@10.11.1`.
