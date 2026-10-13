"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, register } from "@/app/(auth)/actions";
import styles from "./auth.module.css";

export function AuthForm({ mode, callbackUrl }: { mode: "login" | "register"; callbackUrl?: string }) {
  const registering = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(registering ? register : login, undefined);

  return (
    <section className={styles.formSection} aria-labelledby="auth-title">
      <p className={styles.eyebrow}>{registering ? "Your watchlist starts here" : "Your next market check"}</p>
      <h1 id="auth-title">{registering ? "Create an account" : "Welcome back"}<span className={styles.period}>.</span></h1>
      <p className={styles.description}>{registering ? "A little perspective on the stocks you follow." : "Log in to pick up where you left off."}</p>

      <form action={action} className={styles.form} aria-describedby={state?.error ? "auth-error" : undefined}>
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
        <div className={styles.field}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={state?.email} key={state?.email} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <div className={styles.password}>
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} placeholder={registering ? "Create a password" : "Enter your password"} minLength={registering ? 8 : undefined} aria-describedby={registering ? "password-hint" : undefined} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {registering && <p id="password-hint" className={styles.hint}>Use at least 8 characters. <Link href="/privacy">How your data is kept</Link></p>}
        </div>
        <button type="submit" className={styles.submit} disabled={pending}>{pending ? (registering ? "Creating account…" : "Logging in…") : registering ? "Create account" : "Log in"}<span aria-hidden="true">↗</span></button>
        <p className={styles.notice} id="auth-error" role="alert">{state?.error}</p>
      </form>

      <p className={styles.switch}>{registering ? "Already have an account?" : "New to watchlist?"}{" "}<Link href={{ pathname: registering ? "/login" : "/register", query: callbackUrl ? { callbackUrl } : undefined }}>{registering ? "Log in" : "Create an account"}</Link></p>
    </section>
  );
}
