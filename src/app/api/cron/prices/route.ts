import { getDb } from "@/lib/db";
import { runPriceJob } from "@/lib/price-job";

/**
 * The scheduled price job. custom-worker.ts calls it every 5 minutes from a
 * Cloudflare Cron Trigger; CRON_SECRET keeps everyone else out.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return Response.json(await runPriceJob(getDb()));
  } catch (error) {
    console.error("[price-job]", error);
    return Response.json({ error: error instanceof Error ? error.message : "Price job failed" }, { status: 502 });
  }
}
