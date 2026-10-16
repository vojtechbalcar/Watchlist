"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError, CredentialsSignin } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { hashPassword, verifyPassword } from "@/lib/password";
import { consumePasswordReset, requestPasswordReset } from "@/lib/password-reset";
import { allowAttempt, clientAddress } from "@/lib/rate-limit";

export type AuthFormState = { error: string; email: string } | undefined;
export type AccountFormState = { error?: string; success?: string } | undefined;
export type ResetRequestState = { error?: string; sent?: boolean; email: string } | undefined;

const MIN_PASSWORD_LENGTH = 8;
const tooManyAttempts = "Too many attempts. Wait 15 minutes and try again.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (error instanceof CredentialsSignin && error.code === "rate_limited") return { error: tooManyAttempts, email };
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
  if (!emailPattern.test(email)) return { error: "Enter a valid email address.", email };
  if (password.length < MIN_PASSWORD_LENGTH) return { error: "Use at least 8 characters for your password.", email };
  if (!(await allowAttempt(getDb(), "register", clientAddress(await headers())))) return { error: "Too many new accounts from this network. Try again in an hour.", email };

  const existing = await getDb().user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "An account with this email already exists. Log in instead.", email };

  await getDb().user.create({ data: { email, passwordHash: await hashPassword(password) } });
  return startSession(email, password, safeRedirect(formData.get("callbackUrl")));
}

/**
 * Where the emailed link points. Only the Host header: Cloudflare routes by it,
 * while X-Forwarded-Host is whatever the client sent, and trusting it would let
 * anyone mail a victim a link to their own site carrying a valid token.
 */
function originOf(requestHeaders: Headers) {
  const host = requestHeaders.get("host") ?? "localhost";
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  return `${local ? "http" : "https"}://${host}`;
}

/**
 * Emails a reset link. The answer is the same whether or not the address has an
 * account; registration already reveals that, but there's no reason to add a
 * second way.
 */
export async function requestReset(_state: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!emailPattern.test(email)) return { error: "Enter a valid email address.", email };
  const db = getDb();
  const requestHeaders = await headers();
  const [byEmail, byAddress] = await Promise.all([allowAttempt(db, "resetEmail", email), allowAttempt(db, "resetAddress", clientAddress(requestHeaders))]);
  if (!byEmail || !byAddress) return { error: "Too many reset requests. Wait an hour and try again.", email };
  try {
    await requestPasswordReset(db, { email, origin: originOf(requestHeaders), now: new Date(), send: sendPasswordResetEmail });
  } catch (error) {
    console.error("[password-reset] sending failed", error instanceof Error ? error.message : error);
    return { error: "We couldn’t send the email. Try again in a few minutes.", email };
  }
  return { sent: true, email };
}

/** Sets the new password from an emailed link, then signs in with it. */
export async function resetPassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) return { error: "Use at least 8 characters for your password.", email: "" };
  const email = await consumePasswordReset(getDb(), { token, passwordHash: await hashPassword(password), now: new Date() });
  if (!email) return { error: "This link has expired or was already used. Request a new one.", email: "" };
  return startSession(email, password, "/");
}

export async function logout() {
  await signOut({ redirectTo: "/landing" });
}

/**
 * The signed-in account, once its current password checks out. Limited per
 * account, so a session left open on a shared computer can't be used to
 * guess the password.
 */
async function confirmPassword(password: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Your session has ended. Log in again." } as const;
  const db = getDb();
  if (!(await allowAttempt(db, "accountPassword", session.user.id))) return { error: tooManyAttempts } as const;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Your session has ended. Log in again." } as const;
  if (!password || !(await verifyPassword(password, user.passwordHash))) return { error: "That isn’t your current password." } as const;
  return { user } as const;
}

/** Changes the password and ends every other session; this one is signed in again. */
export async function changePassword(_state: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const next = String(formData.get("newPassword") ?? "");
  if (next.length < MIN_PASSWORD_LENGTH) return { error: "Use at least 8 characters for your new password." };
  const confirmed = await confirmPassword(String(formData.get("currentPassword") ?? ""));
  if ("error" in confirmed) return { error: confirmed.error };

  const { user } = confirmed;
  await getDb().user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next), sessionVersion: { increment: 1 } } });
  try {
    await signIn("credentials", { email: user.email, password: next, redirect: false });
  } catch (error) {
    // The password changed; only this browser's session ended with the others.
    if (error instanceof AuthError) return { success: "Password changed. Log in again with your new password." };
    throw error;
  }
  // Redirected rather than re-rendered: a re-render still sees the request's old, now-ended session cookie.
  redirect("/settings?password=changed#account");
}

/** Deletes the account with its saved watchlist and preferences, then signs out. */
export async function deleteAccount(_state: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const confirmed = await confirmPassword(String(formData.get("password") ?? ""));
  if ("error" in confirmed) return { error: confirmed.error };
  // SavedWatchlist and SavedPreferences cascade.
  await getDb().user.delete({ where: { id: confirmed.user.id } });
  await signOut({ redirectTo: "/landing" });
}
