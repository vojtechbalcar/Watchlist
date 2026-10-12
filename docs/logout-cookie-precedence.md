---
type: decision
updated: 2026-10-12
status: current
---

# Logout cookie precedence

Related: [[account-pages]], [[cloudflare-workers-deploy]], [[landing-entry-routing]]

On the live site, logging out returned to the landing page but Go to watchlist reopened the authenticated account. Auth.js renews the session cookie in the proxy, while the logout server action deletes it. OpenNext's default middleware header priority appends the renewed cookie after the deletion, so the browser keeps a valid session. A minimal Next.js dev reproduction applies the deletion last, explaining the environment difference.

`open-next.config.ts` sets `dangerous.headersAndCookiesPriority` to `handler` for POST requests. Server actions can now replace or delete proxy cookies; ordinary GET requests keep the default middleware priority and session renewal.

Rejected: changing landing routing, manually clearing cookies in the client (session cookies are HttpOnly), or bypassing authentication for server actions. The failure is response cookie precedence in the deployment adapter, not navigation or session validation. Applying handler priority to every request would unnecessarily change GET behavior.

`tests/logout.test.mjs` runs real Auth.js session renewal through the installed OpenNext response merger. Before the fix, the final cookie was the renewed session. After the fix, deletion wins and the next watchlist request redirects to login. A second test checks that GET requests still renew valid sessions. This is an adapter regression test, not a live deployment browser test.
