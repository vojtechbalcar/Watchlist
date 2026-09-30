"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export type AuthFormState = { error: string; email: string } | undefined;

/**
 * Auth.js passes the page a visitor was stopped at as a full URL. Keep only its
 * path, so the form can never redirect off-site.
 */
function safeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return "/";
  try {
    const url = new URL(value, "http://watchlist.local");
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}

async function startSession(email: string, password: string, redirectTo: string): Promise<AuthFormState> {
  try {
    // Throws Next's redirect on success, which must propagate.
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.type === "CredentialsSignin" ? "That email and password don’t match an account." : "We couldn’t sign you in. Please try again.", email };
    }
    throw error;
  }
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  return startSession(email, password, safeRedirect(formData.get("callbackUrl")));
}

export async function register(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address.", email };
  if (password.length < 8) return { error: "Use at least 8 characters for your password.", email };

  const existing = await getDb().user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "An account with this email already exists. Log in instead.", email };

  await getDb().user.create({ data: { email, passwordHash: await hashPassword(password) } });
  return startSession(email, password, safeRedirect(formData.get("callbackUrl")));
}

export async function logout() {
  await signOut({ redirectTo: "/landing" });
}
