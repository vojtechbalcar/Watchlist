/**
 * Runs before `opennextjs-cloudflare build` so a schema change reaches the
 * database before the code that needs it is deployed. Only on Cloudflare's
 * build machines: a local `pnpm run build` must never migrate the live
 * database (use `pnpm db:deploy` for that). Migrations are additive by
 * convention, so the code still running until the deploy finishes keeps
 * working against the new schema.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** "migrate", "warn" (a Cloudflare build without credentials), or "skip" (local). */
export function migrationStep(env) {
  const onCloudflare = Boolean(env.WORKERS_CI) || (Boolean(env.CI) && env.CI !== "false");
  if (!onCloudflare) return "skip";
  return env.DATABASE_URL ? "migrate" : "warn";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const step = migrationStep(process.env);
  if (step === "migrate") {
    const result = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
    process.exit(result.status ?? 1);
  }
  if (step === "warn") {
    console.warn("⚠ DATABASE_URL isn't set for this build, so migrations were NOT applied. Add it under the Worker's Settings → Build → Variables and secrets, or run `pnpm db:deploy` before deploying a schema change.");
  }
}
