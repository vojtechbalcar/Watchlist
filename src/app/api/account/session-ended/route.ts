import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

/**
 * Where the market layout sends a session src/auth.ts no longer accepts (the
 * account was deleted, or its password changed elsewhere). The proxy only
 * checks the cookie's signature, so without clearing it here /login would
 * send the visitor straight back. A valid session is left alone.
 */
export async function GET() {
  if (await auth()) redirect("/");
  await signOut({ redirectTo: "/login" });
}
