import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { sendPasswordResetEmail } = await import("../src/lib/email.ts");

function environment(t, values) {
  const saved = {};
  for (const [key, value] of Object.entries(values)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  t.after(() => { for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
}

test("the reset email goes through Postmark with link tracking off", async t => {
  environment(t, { POSTMARK_SERVER_TOKEN: "server-token", EMAIL_FROM: "Watchlist <hello@usewatchlist.dev>" });
  t.mock.method(globalThis, "fetch", async () => Response.json({ ErrorCode: 0, Message: "OK" }));
  await sendPasswordResetEmail("ada@example.com", "https://usewatchlist.dev/reset-password?token=abc");

  const [url, init] = globalThis.fetch.mock.calls[0].arguments;
  assert.equal(url, "https://api.postmarkapp.com/email");
  assert.equal(init.method, "POST");
  assert.equal(init.headers["X-Postmark-Server-Token"], "server-token");
  const body = JSON.parse(init.body);
  assert.equal(body.From, "Watchlist <hello@usewatchlist.dev>");
  assert.equal(body.To, "ada@example.com");
  assert.equal(body.MessageStream, "outbound");
  assert.equal(body.TrackLinks, "None");
  assert.equal(body.TrackOpens, false);
  assert.ok(body.TextBody.includes("https://usewatchlist.dev/reset-password?token=abc"));
  assert.ok(body.HtmlBody.includes("https://usewatchlist.dev/reset-password?token=abc"));
});

test("a Postmark rejection is an error with Postmark's reason", async t => {
  environment(t, { POSTMARK_SERVER_TOKEN: "server-token", EMAIL_FROM: "hello@usewatchlist.dev" });
  t.mock.method(globalThis, "fetch", async () => Response.json({ ErrorCode: 400, Message: "Sender signature not confirmed" }, { status: 422 }));
  await assert.rejects(sendPasswordResetEmail("ada@example.com", "https://x/reset-password?token=abc"), /Sender signature not confirmed/);
});

test("without Postmark, development prints the link and production refuses", async t => {
  environment(t, { POSTMARK_SERVER_TOKEN: undefined, EMAIL_FROM: undefined, NODE_ENV: "development" });
  t.mock.method(globalThis, "fetch", async () => assert.fail("no request without a token"));
  const logged = t.mock.method(console, "info", () => {});
  await sendPasswordResetEmail("ada@example.com", "http://localhost:3001/reset-password?token=abc");
  assert.ok(logged.mock.calls.some(call => call.arguments.join(" ").includes("token=abc")));

  process.env.NODE_ENV = "production";
  await assert.rejects(sendPasswordResetEmail("ada@example.com", "https://x/reset-password?token=abc"), /POSTMARK_SERVER_TOKEN/);
});
