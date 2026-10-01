import { cache } from "react";
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma Postgres over HTTP rather than a TCP socket. A deployed Worker cannot
 * open the raw connection `@prisma/adapter-pg` needs — workerd refuses it with
 * "cannot connect to the specified address" — even though the same code
 * connects from `wrangler dev` and `next start`, which use the host's network.
 * The connection string is unchanged: this driver sends it as a credential
 * instead of dialling it. `prisma/seed.ts` and migrations keep the pg adapter,
 * since they run in Node where TCP works.
 *
 * Still one client per request: Workers cannot reuse one across requests.
 */
export const getDb = cache(() => {
  const connectionString = process.env.DATABASE_URL;
  // Without this the driver fails later, inside a query, as an opaque error.
  if (!connectionString) throw new Error("DATABASE_URL is not set. On Cloudflare it must be a secret on the gowatchlist Worker.");
  return new PrismaClient({ adapter: new PrismaPostgresAdapter({ connectionString }) });
});
