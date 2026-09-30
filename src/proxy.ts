import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Built from the database-free config only; see src/auth.config.ts.
export default NextAuth(authConfig).auth;

export const config = {
  // API routes authenticate themselves (Auth.js, and the cron job's CRON_SECRET).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|woff2?|ttf|eot)$).*)"],
};
