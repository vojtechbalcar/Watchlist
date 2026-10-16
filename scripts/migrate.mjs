/**
 * Runs before `opennextjs-cloudflare build` so a schema change reaches the
 * database before the code that needs it is deployed. Only on Cloudflare's
 * build machines: a local `pnpm run build` must never migrate the live
 * database (use `pnpm db:deploy` for that). Migrations are additive by
 * convention, so the code still running until the deploy finishes keeps
 * working against the new schema.
 *
 * A Cloudflare build without DATABASE_URL fails: deploying code whose
 * migration never ran breaks it in production, while a failed build leaves
 * the previous version serving and shows up as a failed check on the commit.
 *
 * Builds of any other branch skip migrations. They share the production
 * database, so migrating there would apply a pull request's schema change to
 * production before it is merged.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PRODUCTION_BRANCH = "main";

/** "migrate", "fail" (a production build without credentials), or "skip" (local, or another branch). */
export function migrationStep(env) {
  const onCloudflare = Boolean(env.WORKERS_CI) || (Boolean(env.CI) && env.CI !== "false");
  if (!onCloudflare) return "skip";
  // Workers Builds names the branch; a build without one is treated as production.
  if (env.WORKERS_CI_BRANCH && env.WORKERS_CI_BRANCH !== PRODUCTION_BRANCH) return "skip";
  return env.DATABASE_URL ? "migrate" : "fail";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const step = migrationStep(process.env);
  if (step === "migrate") {
    const result = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
    process.exit(result.status ?? 1);
  }
  if (step === "fail") {
    console.error("✘ DATABASE_URL isn't set for this build, so migrations can't be applied and the deploy is stopped. Add it under the Worker's Settings → Build → Variables and secrets.");
    process.exit(1);
  }
}
