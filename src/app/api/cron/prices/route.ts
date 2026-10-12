import type { PrismaClient } from "@prisma/client";
import { isCronRequest } from "@/lib/cron-secret";
import { getDb } from "@/lib/db";
import { PRICE_JOB_FAILED, PRICE_JOB_SUCCEEDED } from "@/lib/price-health";
import { runPriceJob } from "@/lib/price-job";

/** Stored so /api/cron/health can tell a failing job from a quiet one. */
async function record(db: PrismaClient, job: string, now: Date) {
  await db.jobState.upsert({ where: { job }, create: { job, ranAt: now }, update: { ranAt: now } }).catch(error => console.error("[price-job] recording outcome", error));
}

/**
 * The scheduled price job. The lightweight workers/price-scheduler Worker
 * calls it every five minutes; GitHub Actions is manual recovery only.
 */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const now = new Date();
  try {
    const report = await runPriceJob(db, now);
    await record(db, PRICE_JOB_SUCCEEDED, now);
    return Response.json(report);
  } catch (error) {
    console.error("[price-job]", error);
    await record(db, PRICE_JOB_FAILED, now);
    return Response.json({ error: error instanceof Error ? error.message : "Price job failed" }, { status: 502 });
  }
}
