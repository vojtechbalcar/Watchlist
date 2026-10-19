import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { passwordResetEmail, sendPasswordResetEmail } = await import("../src/lib/email.ts");

function environment(t, values) {
  const saved = {};
  for (const [key, value] of Object.entries(values)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  t.after(() => { for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
}

test("the reset email goes through Resend's API", async t => {
  environment(t, { RESEND_API_KEY: "re_key", EMAIL_FROM: "Watchlist <hello@usewatchlist.dev>" });
  t.mock.method(globalThis, "fetch", async () => Response.json({ id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" }));
  await sendPasswordResetEmail("ada@example.com", "https://usewatchlist.dev/reset-password?token=abc");

  const [url, init] = globalThis.fetch.mock.calls[0].arguments;
  assert.equal(url, "https://api.resend.com/emails");
  assert.equal(init.method, "POST");
  assert.equal(init.headers.Authorization, "Bearer re_key");
  const body = JSON.parse(init.body);
  assert.equal(body.from, "Watchlist <hello@usewatchlist.dev>");
  assert.deepEqual(body.to, ["ada@example.com"]);
  assert.ok(body.text.includes("https://usewatchlist.dev/reset-password?token=abc"));
  assert.ok(body.html.includes("https://usewatchlist.dev/reset-password?token=abc"));
});

test("the styled reset email escapes its button and fallback URLs and retains plain text", async t => {
  environment(t, { RESEND_API_KEY: "re_key", EMAIL_FROM: "hello@usewatchlist.dev" });
  t.mock.method(globalThis, "fetch", async () => Response.json({ id: "1" }));
  await sendPasswordResetEmail("ada@example.com", "https://x/reset-password?token=a&b=\"c\"");

  const { html, text } = JSON.parse(globalThis.fetch.mock.calls[0].arguments[1].body);
  assert.match(html, /^<!doctype html>/);
  assert.ok(html.includes("Choose a new password"));
  assert.ok(html.includes("token=a&#38;b=&#34;c&#34;"));
  assert.ok(!html.includes('token=a&b="c"'));
  assert.equal([...html.matchAll(/href="https:\/\/x\/reset-password\?token=a&#38;b=&#34;c&#34;"/g)].length, 2);
  assert.ok(text.includes('https://x/reset-password?token=a&b="c"'));
});

test("a Resend rejection is an error with Resend's reason", async t => {
  environment(t, { RESEND_API_KEY: "re_key", EMAIL_FROM: "hello@usewatchlist.dev" });
  t.mock.method(globalThis, "fetch", async () => Response.json({ statusCode: 403, name: "validation_error", message: "The usewatchlist.dev domain is not verified." }, { status: 403 }));
  await assert.rejects(sendPasswordResetEmail("ada@example.com", "https://x/reset-password?token=abc"), /403.*domain is not verified/);
});

test("without Resend, development prints the link and production refuses", async t => {
  environment(t, { RESEND_API_KEY: undefined, EMAIL_FROM: undefined, NODE_ENV: "development" });
  t.mock.method(globalThis, "fetch", async () => assert.fail("no request without a key"));
  const logged = t.mock.method(console, "info", () => {});
  await sendPasswordResetEmail("ada@example.com", "http://localhost:3001/reset-password?token=abc");
  assert.ok(logged.mock.calls.some(call => call.arguments.join(" ").includes("token=abc")));

  process.env.NODE_ENV = "production";
  await assert.rejects(sendPasswordResetEmail("ada@example.com", "https://x/reset-password?token=abc"), /RESEND_API_KEY/);
});

test("the reset email follows the app's design without remote content", () => {
  const { subject, text, html } = passwordResetEmail("https://usewatchlist.dev/reset-password?token=abc");
  assert.equal(subject, "Reset your Watchlist password");
  assert.ok(text.includes("https://usewatchlist.dev/reset-password?token=abc"));
  assert.match(html, /border-radius:9999px;background:#141414/);
  assert.match(html, /border-radius:24px;background:#f3f3f3/);
  assert.match(html, /color:#8c3b52;">\.<\/span>/);
  assert.match(html, /<meta name="color-scheme" content="light">/);
  // Every style attribute closes where it should: the font stack can't end it early.
  for (const [, style] of html.matchAll(/style="([^"]*)"/g)) assert.doesNotMatch(style, /font-family:$/);
  assert.match(html, /font-family:'Helvetica Neue',Helvetica,Arial,sans-serif/);
  // No images, fonts, or styles fetched when the email opens.
  assert.doesNotMatch(html, /<img|<link|url\(|@import/i);
  assert.ok(html.includes('href="https://usewatchlist.dev/privacy"'));
});
