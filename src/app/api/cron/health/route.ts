import { isCronRequest } from "@/lib/cron-secret";
import { getDb } from "@/lib/db";
import { PRICE_JOB_FAILED, PRICE_JOB_SUCCEEDED, priceHealth } from "@/lib/price-health";
import { readTrackedStates } from "@/lib/price-job";

/**
 * Whether stored prices are as fresh as the schedule promises: 200 when they
 * are, 503 with the problems when not. .github/workflows/price-health.yml
 * checks it, so a failing price job surfaces as a failed workflow and email.
 */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const [states, runs] = await Promise.all([
    readTrackedStates(db),
    db.jobState.findMany({ where: { job: { in: [PRICE_JOB_SUCCEEDED, PRICE_JOB_FAILED] } } }),
  ]);
  const ranAt = (job: string) => runs.find(run => run.job === job)?.ranAt ?? null;
  const health = priceHealth({ states, lastSuccess: ranAt(PRICE_JOB_SUCCEEDED), lastFailure: ranAt(PRICE_JOB_FAILED), now: new Date() });
  return Response.json(health, { status: health.healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
