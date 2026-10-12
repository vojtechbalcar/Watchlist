import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import "tsx/cjs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
// Auth.js can override request URLs from the shell; keep this test process on its fixture origin.
process.env.AUTH_URL = "http://localhost";
// Node renders the real components; their stylesheet imports need no processing here.
require.extensions[".css"] = () => {};
const { default: LandingPage } = require("../src/app/landing/page.tsx");
const { AuthForm } = require("../src/components/auth-form.tsx");
const { authConfig } = require("../src/auth.config.ts");
const { default: NextAuth } = require("next-auth");
const { encode } = require("next-auth/jwt");
const { NextRequest } = require("next/server");
const watchlist = require("../src/lib/watchlist-state.ts");
const { reconcileWatchlist } = require("../src/lib/watchlist-sync.ts");

const entry = "/watchlist?setup=continue";
const secret = "landing-entry-regression-test-secret";
const draft = { version: 1, step: 2, interests: ["Technology"], selected: ["MSFT"] };

test("every landing watchlist CTA enters through the authenticated watchlist", () => {
  const markup = renderToStaticMarkup(createElement(LandingPage));
  const links = [...markup.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .filter(([, , content]) => /Go to watchlist|Create your watchlist|Make it your watchlist/.test(content));
  assert.equal(links.length, 7, "header, hero, four tour panels, and closing CTA");
  for (const [, href] of links) assert.equal(href, entry);
});

test("signed-out entry reaches login with the complete watchlist callback", async () => {
  const auth = NextAuth({ ...authConfig, secret }).auth;
  const response = await auth(new NextRequest(`http://localhost${entry}`));
  assert.equal(response.status, 307);
  const destination = new URL(response.headers.get("location"));
  assert.equal(destination.pathname, "/login");
  assert.equal(destination.searchParams.get("callbackUrl"), `http://localhost${entry}`);
});

test("a valid session enters the watchlist without visiting the account pages", async () => {
  const cookieName = "authjs.session-token";
  const token = await encode({ secret, salt: cookieName, token: { sub: "current-account", email: "entry@example.test" } });
  const auth = NextAuth({ ...authConfig, secret }).auth;
  const response = await auth(new NextRequest(`http://localhost${entry}`, {
    // Next's server supplies the protocol; Auth.js uses it to choose the cookie prefix.
    headers: { cookie: `${cookieName}=${token}`, "x-forwarded-proto": "http", host: "localhost" },
  }));
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("x-middleware-next"), "1");
});

test("login and registration preserve the entry callback in forms and account-switch links", () => {
  for (const mode of ["login", "register"]) {
    const markup = renderToStaticMarkup(createElement(AuthForm, { mode, callbackUrl: entry }));
    assert.ok(markup.includes(`<input type="hidden" name="callbackUrl" value="${entry}"`));
    const switchUrl = new URL(markup.match(/href="([^"]+)"/)[1], "http://localhost");
    assert.equal(switchUrl.pathname, mode === "login" ? "/register" : "/login");
    assert.equal(switchUrl.searchParams.get("callbackUrl"), entry);
  }
});

test("landing entry starts new setup and resumes an unfinished saved draft", () => {
  for (const state of [watchlist.emptyWatchlist, { ...watchlist.emptyWatchlist, setupDraft: draft }]) {
    assert.equal(watchlist.shouldOpenWatchlistSetup(state, true), true);
  }
});

test("completed, skipped, and legacy populated watchlists keep their workspace", () => {
  for (const state of [
    { ...watchlist.emptyWatchlist, setupCompleted: true },
    { ...watchlist.emptyWatchlist, setupCompleted: true, setupDraft: draft },
    { ...watchlist.emptyWatchlist, setupDismissed: true, setupDraft: draft },
    { ...watchlist.emptyWatchlist, tickers: ["MSFT"] },
  ]) assert.equal(watchlist.shouldOpenWatchlistSetup(state, true), false);
});

test("ordinary dashboard and watchlist visits retain the explicit Continue setup choice", () => {
  assert.equal(watchlist.shouldOpenWatchlistSetup(watchlist.emptyWatchlist, false), true);
  assert.equal(watchlist.shouldOpenWatchlistSetup({ ...watchlist.emptyWatchlist, setupDraft: draft }, false), false);
});

test("entry decisions use the reconciled account state instead of another account's cached completion", () => {
  const { local } = reconcileWatchlist({
    server: { ...watchlist.emptyWatchlist, setupDraft: draft },
    local: { ...watchlist.emptyWatchlist, setupCompleted: true, tickers: ["AAPL"] },
    localOwner: "previous-account", userId: "current-account", editedBeforeLoad: false,
  });
  assert.equal(watchlist.shouldOpenWatchlistSetup(local, true), true);
  assert.deepEqual(local.setupDraft, draft);
});
