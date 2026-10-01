import { cache } from "react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * One client per request. Cloudflare Workers can't reuse a connection across
 * requests, so there is no process-wide pool; `maxUses: 1` keeps pg from trying.
 */
export const getDb = cache(() => {
  // Without a URL pg silently dials localhost, which on Workers surfaces only as
  // "cannot connect to the specified address" (Auth.js: CallbackRouteError).
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. On Cloudflare it must be a Worker secret.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, maxUses: 1 }) });
});
