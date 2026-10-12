import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { createRequire } from "node:module";
import test from "node:test";
import "tsx/cjs";

const require = createRequire(import.meta.url);
const { default: config } = require("../open-next.config.ts");
const { authConfig } = require("../src/auth.config.ts");
const { default: NextAuth } = require("next-auth");
const { encode } = require("next-auth/jwt");
const { NextRequest } = require("next/server");
const adapterRequire = createRequire(require.resolve("@opennextjs/cloudflare"));
const { OpenNextNodeResponse } = adapterRequire("@opennextjs/aws/http/openNextResponse.js");

process.env.AUTH_URL = "https://watchlist.example";
const secret = "logout-regression-test-secret";
const name = "__Secure-authjs.session-token";
const auth = NextAuth({ ...authConfig, secret }).auth;

function request(cookie, method = "GET") {
  return new NextRequest("https://watchlist.example/watchlist", {
    method,
    headers: { cookie, host: "watchlist.example", "x-forwarded-proto": "https" },
  });
}

async function mergedCookies(method, handlerCookies) {
  const token = await encode({ secret, salt: name, token: { sub: "account", email: "logout@example.test" } });
  const proxy = await auth(request(`${name}=${token}`, method));
  const event = { method, headers: {}, rawPath: "/watchlist" };
  const priority = config.dangerous?.headersAndCookiesPriority?.(event) ?? "middleware";
  const previous = globalThis.__openNextAls;
  const storage = new AsyncLocalStorage();
  globalThis.__openNextAls = storage;
  try {
    return storage.run({ mergeHeadersPriority: priority }, () => {
      const response = new OpenNextNodeResponse((headers) => headers, () => {}, undefined, {
        "set-cookie": proxy.headers.getSetCookie(),
      });
      response.setHeader("set-cookie", handlerCookies);
      response.flushHeaders();
      return response.getHeader("set-cookie");
    });
  } finally {
    globalThis.__openNextAls = previous;
  }
}

test("Cloudflare logout leaves the browser signed out after the proxy renews the session", async () => {
  // Browsers apply same-name, same-path Set-Cookie headers in response order.
  const cookies = await mergedCookies("POST", [`${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`]);
  const sessionCookies = cookies.filter((cookie) => cookie.startsWith(`${name}=`));
  assert.ok(sessionCookies.length >= 2, "exercise the renewed cookie and logout cookie together");
  const finalCookie = sessionCookies.at(-1);
  assert.match(finalCookie, /Max-Age=0/, "the logout must override the proxy's renewal");
  const next = await auth(request(finalCookie.split(";")[0]));
  assert.equal(new URL(next.headers.get("location")).pathname, "/login");
});

test("ordinary Cloudflare page requests still renew a valid session", async () => {
  const cookies = await mergedCookies("GET", []);
  const cookie = cookies.filter((value) => value.startsWith(`${name}=`)).at(-1);
  assert.ok(cookie);
  assert.doesNotMatch(cookie, /Max-Age=0/);
  const next = await auth(request(cookie.split(";")[0]));
  assert.equal(next.headers.get("location"), null);
});
