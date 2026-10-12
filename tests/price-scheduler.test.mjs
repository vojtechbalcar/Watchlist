import assert from "node:assert/strict";
import test from "node:test";
import scheduler, { requestPriceJob } from "../workers/price-scheduler/index.mjs";

const env = { CRON_SECRET: "test-only-secret" };
const report = { listings: 0, ciks: 0, sectors: 0, closes: [], quotes: ["AAPL"] };

test("the scheduler authenticates to the app, prevents redirects, and waits for the report", async () => {
  const result = await requestPriceJob(env, async (url, options) => {
    assert.equal(url, "https://usewatchlist.dev/api/cron/prices");
    assert.equal(options.headers.Authorization, `Bearer ${env.CRON_SECRET}`);
    assert.equal(options.redirect, "manual");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(report);
  });
  assert.deepEqual(result, report);
  assert.equal(typeof scheduler.scheduled, "function");
});

test("missing credentials fail before making a request", async () => {
  await assert.rejects(requestPriceJob({}, () => assert.fail("must not request without a secret")), /CRON_SECRET/);
});

test("one transient HTTP failure is retried", async () => {
  let attempts = 0;
  assert.deepEqual(await requestPriceJob(env, async () => ++attempts === 1
    ? new Response("error code: 1102", { status: 500 })
    : Response.json(report)), report);
  assert.equal(attempts, 2);
});

test("a network failure is retried once", async () => {
  let attempts = 0;
  assert.deepEqual(await requestPriceJob(env, async () => {
    if (++attempts === 1) throw new TypeError("fetch failed");
    return Response.json(report);
  }), report);
  assert.equal(attempts, 2);
});

test("persistent failures reject after two attempts, so cron reports a failure", async () => {
  let attempts = 0;
  await assert.rejects(requestPriceJob(env, async () => {
    attempts++;
    return new Response("upstream unavailable", { status: 502 });
  }), /502/);
  assert.equal(attempts, 2);
});

test("an invalid secret is not retried or exposed in the error", async () => {
  let attempts = 0;
  await assert.rejects(requestPriceJob(env, async () => {
    attempts++;
    return new Response("Unauthorized", { status: 401 });
  }), error => /401/.test(error.message) && !error.message.includes(env.CRON_SECRET));
  assert.equal(attempts, 1);
});

test("a successful HTTP response without a job report is rejected", async () => {
  await assert.rejects(requestPriceJob(env, async () => Response.json({ error: "not a job report" })), /report/);
});

test("redirects fail without forwarding the credential or retrying", async () => {
  let attempts = 0;
  await assert.rejects(requestPriceJob(env, async () => {
    attempts++;
    return new Response(null, { status: 302, headers: { location: "https://example.invalid" } });
  }), /302/);
  assert.equal(attempts, 1);
});
