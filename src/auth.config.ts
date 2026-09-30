import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

/** Pages a signed-out visitor may see. Everything else needs an account. */
const publicPaths = new Set(["/landing", "/login", "/register"]);
const accountPaths = new Set(["/login", "/register"]);

/**
 * The part of the Auth.js setup src/proxy.ts runs: reading the session cookie
 * and gating pages. It must not import the database; Prisma in the proxy
 * bundle breaks it on Cloudflare. src/auth.ts adds the Credentials provider.
 */
export const authConfig = {
  // Off Vercel, Auth.js rejects the request host unless told the platform sets it (Cloudflare does).
  trustHost: true,
  // Credentials sign-in requires JWT sessions: the session is a signed cookie, not a table.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    // Runs in src/proxy.ts as an optimistic gate; the market layout checks the session again.
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const signedIn = Boolean(auth?.user);
      if (accountPaths.has(pathname) && signedIn) return NextResponse.redirect(new URL("/", request.nextUrl));
      if (publicPaths.has(pathname) || signedIn) return true;
      // The bare home page introduces the product rather than demanding a login.
      if (pathname === "/") return NextResponse.redirect(new URL("/landing", request.nextUrl));
      return false;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
