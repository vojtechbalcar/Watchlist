import { cache } from "react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * One client per request. Cloudflare Workers can't reuse a connection across
 * requests, so there is no process-wide pool; `maxUses: 1` keeps pg from trying.
 */
export const getDb = cache(() => new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, maxUses: 1 }) }));
