// `vercel env pull` writes .env.local, which dotenv does not read by default.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Client generation runs during install, before database credentials may exist.
    // Prisma commands that connect to Postgres still require this URL.
    url: process.env.DATABASE_URL,
  },
});
