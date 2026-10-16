"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestReset, resetPassword } from "@/app/(auth)/actions";
import styles from "./auth.module.css";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestReset, undefined);

  return (
    <section className={styles.formSection} aria-labelledby="auth-title">
      <p className={styles.eyebrow}>It happens</p>
      <h1 id="auth-title">Reset your password<span className={styles.period}>.</span></h1>
      <p className={styles.description}>Enter the email you log in with. We’ll send a link to choose a new password.</p>

      <form action={action} className={styles.form} aria-describedby={state?.error ? "auth-error" : undefined}>
        <div className={styles.field}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={state?.email} key={state?.email} required />
        </div>
        <button type="submit" className={styles.submit} disabled={pending}>{pending ? "Sending link…" : state?.sent ? "Send another link" : "Send reset link"}<span aria-hidden="true">↗</span></button>
        <p className={styles.notice} id="auth-error" role="alert">{state?.error}</p>
        <p className={styles.notice} role="status">{state?.sent && `If ${state.email} has a watchlist account, a link to choose a new password is on its way. It works once, for an hour. Nothing after a few minutes? Check your spam folder.`}</p>
      </form>

      <p className={styles.switch}>Remembered it? <Link href="/login">Log in</Link></p>
    </section>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(resetPassword, undefined);

  return (
    <section className={styles.formSection} aria-labelledby="auth-title">
      <p className={styles.eyebrow}>Almost there</p>
      <h1 id="auth-title">Choose a new password<span className={styles.period}>.</span></h1>
      <p className={styles.description}>You’ll be logged in with it, and logged out everywhere else.</p>

      <form action={action} className={styles.form} aria-describedby={state?.error ? "auth-error" : undefined}>
        <input type="hidden" name="token" value={token} />
        <div className={styles.field}>
          <label htmlFor="password">New password</label>
          <div className={styles.password}>
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a password" minLength={8} aria-describedby="password-hint" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          <p id="password-hint" className={styles.hint}>Use at least 8 characters.</p>
        </div>
        <button type="submit" className={styles.submit} disabled={pending}>{pending ? "Saving…" : "Save and log in"}<span aria-hidden="true">↗</span></button>
        <p className={styles.notice} id="auth-error" role="alert">{state?.error}{state?.error && <> <Link href="/forgot-password">Send a new link</Link></>}</p>
      </form>
    </section>
  );
}
