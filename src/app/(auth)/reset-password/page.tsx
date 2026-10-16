import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/password-reset-forms";
import styles from "@/components/auth.module.css";
import { getDb } from "@/lib/db";
import { resetLinkValid } from "@/lib/password-reset";

export const metadata: Metadata = { title: "Choose a new password | Watchlist", referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  if (typeof token === "string" && token && (await resetLinkValid(getDb(), token, new Date()))) return <ResetPasswordForm token={token} />;

  return (
    <section className={styles.formSection} aria-labelledby="auth-title">
      <p className={styles.eyebrow}>Password reset</p>
      <h1 id="auth-title">This link has expired<span className={styles.period}>.</span></h1>
      <p className={styles.description}>Reset links work once, for an hour, and a newer link replaces older ones.</p>
      <p className={styles.switch}><Link href="/forgot-password">Send a new link</Link><Link href="/login">Log in</Link></p>
    </section>
  );
}
