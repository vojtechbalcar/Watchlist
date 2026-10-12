// Keep this Worker independent of Next.js and Prisma: loading the app in a
// scheduled invocation exceeds the Workers Free plan's CPU allowance.
const PRICE_JOB_URL = "https://usewatchlist.dev/api/cron/prices";

export async function requestPriceJob(env, fetcher = fetch) {
  if (!env.CRON_SECRET) throw new Error("CRON_SECRET is not set on the price scheduler");

  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await fetcher(PRICE_JOB_URL, {
        headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
        // workerd supports "manual", not "error". Reject any 3xx below.
        redirect: "manual",
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      if (attempt === 0) continue;
      throw error;
    }
    if (!response.ok) {
      await response.body?.cancel();
      if (response.status >= 500 && attempt === 0) continue;
      throw new Error(`Price job returned HTTP ${response.status}`);
    }
    const report = await response.json();
    if (!Array.isArray(report?.closes) || !Array.isArray(report?.quotes)) {
      throw new Error("Price job returned an invalid report");
    }
    return report;
  }
}

const scheduler = {
  async scheduled(controller, env) {
    const report = await requestPriceJob(env);
    console.log(JSON.stringify({ scheduledAt: new Date(controller.scheduledTime).toISOString(), ...report }));
  },
};

export default scheduler;
