"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="auth-form-section" aria-labelledby="auth-title">
      <p className="eyebrow">{registering ? "Your watchlist starts here" : "Your next market check"}</p>
      <h1 id="auth-title">{registering ? "Create an account" : "Welcome back"}</h1>
      <p className="auth-description">{registering ? "A little perspective on the stocks you follow." : "Log in to pick up where you left off."}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="auth-password">
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} placeholder={registering ? "Create a password" : "Enter your password"} minLength={registering ? 8 : undefined} aria-describedby={registering ? "password-hint" : undefined} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {registering && <p id="password-hint" className="auth-hint">Use at least 8 characters.</p>}
        </div>
        <button type="submit" className="auth-submit">{registering ? "Create account" : "Log in"}<span aria-hidden="true">↗</span></button>
        <p className="auth-notice" role="status">{submitted ? "Accounts aren’t available yet. You can explore the demo while we finish setting up sign-in." : "Preview only — sign-in and account creation are coming soon."}</p>
      </form>

      <p className="auth-switch">{registering ? "Already have an account?" : "New to watchlist?"}{" "}<Link href={registering ? "/login" : "/register"}>{registering ? "Log in" : "Create an account"}</Link></p>
    </section>
  );
}
