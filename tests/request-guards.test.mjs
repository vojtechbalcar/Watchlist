import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { bearerMatches, readJsonBody } = await import("../src/lib/request-guards.ts");

test("the cron secret must match exactly", () => {
  assert.equal(bearerMatches("Bearer s3cret", "s3cret"), true);
  assert.equal(bearerMatches("Bearer s3cre", "s3cret"), false);
  assert.equal(bearerMatches("s3cret", "s3cret"), false);
  assert.equal(bearerMatches(null, "s3cret"), false);
  assert.equal(bearerMatches("Bearer ", undefined), false);
});

test("saved-state bodies are capped and must be JSON", async () => {
  const request = (body) => new Request("http://localhost/api/watchlist", { method: "PUT", body });
  assert.deepEqual(await readJsonBody(request('{"state":{"tickers":["AAPL"]}}')), { state: { tickers: ["AAPL"] } });
  assert.equal(await readJsonBody(request("{broken")), null);
  assert.equal(await readJsonBody(request(JSON.stringify({ state: "x".repeat(70_000) }))), "too-large");
});
