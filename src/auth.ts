import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

/** Pages a signed-out visitor may see. Everything else needs an account. */
const publicPaths = new Set(["/landing", "/login", "/register"]);
const accountPaths = new Set(["/login", "/register"]);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Credentials sign-in requires JWT sessions: the session is a signed cookie, not a table.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
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
});
