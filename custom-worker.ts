// The OpenNext worker, plus a Cron Trigger that runs the price job.
// See https://opennext.js.org/cloudflare/howtos/custom-worker

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string };

const worker = {
  fetch: handler.fetch,

  async scheduled(_controller: unknown, env: Env, ctx: unknown) {
    // The host is irrelevant to the route; Next routes on the path.
    const request = new Request("https://worker.internal/api/cron/prices", { headers: { authorization: `Bearer ${env.CRON_SECRET}` } });
    const response: Response = await handler.fetch(request, env, ctx);
    const body = await response.text();
    if (response.ok) console.log("[price-job]", body);
    else console.error("[price-job]", response.status, body);
  },
};

export default worker;
