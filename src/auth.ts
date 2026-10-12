import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { allowAttempt, clientAddress } from "@/lib/rate-limit";

/** Too many sign-ins for one email or from one address; src/app/(auth)/actions.ts explains it. */
export class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      // Limited here rather than in the login action, so posting to Auth.js's own callback route is limited too.
      async authorize(credentials, request) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password) return null;
        const db = getDb();
        try {
          const [byEmail, byAddress] = await Promise.all([allowAttempt(db, "loginEmail", email), allowAttempt(db, "loginAddress", clientAddress(request.headers))]);
          if (!byEmail || !byAddress) throw new TooManyAttempts();
          const user = await db.user.findUnique({ where: { email } });
          if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
          return { id: user.id, email: user.email, name: user.name, sessionVersion: user.sessionVersion };
        } catch (error) {
          // Auth.js logs only a bare CallbackRouteError when the cause isn't a plain Error; keep the real one.
          if (!(error instanceof TooManyAttempts)) console.error("[auth] authorize failed", error instanceof Error ? error.stack : error, JSON.stringify(error, Object.getOwnPropertyNames(error ?? {})));
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Only server code runs this; the proxy builds from authConfig, which has no database.
    async jwt({ token, user }) {
      if (user) return { ...token, sessionVersion: (user as { sessionVersion?: number }).sessionVersion ?? 0 };
      if (!token.sub) return null;
      // A deleted account, or a password changed since this session began, ends the session.
      // A database error keeps the session: Auth.js would otherwise delete the cookie and sign everyone out over a blip.
      const current = await getDb().user.findUnique({ where: { id: token.sub }, select: { sessionVersion: true } }).catch(error => {
        console.error("[auth] session check", error);
        return undefined;
      });
      if (current === undefined) return token;
      return current && current.sessionVersion === (token.sessionVersion ?? 0) ? token : null;
    },
  },
});
