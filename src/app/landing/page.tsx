import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { LandingIllustration } from "@/components/landing-illustration";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Watchlist — Your stocks. In context.",
  description: "Is your stock beating its benchmark, or just moving with it? See the difference with Watchlist.",
};

const sourceUrl = "https://github.com/vojtechbalcar/Watchlist";
// Temporary entry point until auth and onboarding state determine the destination.
const watchlistEntryUrl = "/register";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/landing" aria-label="Watchlist home"><Wordmark className={styles.wordmark} /></Link>
        <nav className={styles.navigation} aria-label="Landing navigation">
          <a href={sourceUrl}>Source code <span aria-hidden="true">↗</span></a>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/login" className={styles.signIn}>Sign in</Link>
          <Link href={watchlistEntryUrl} className={styles.headerCta}>Go to watchlist <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <main className={styles.hero}>
        <section className={styles.copy} aria-labelledby="hero-title">
          <h1 id="hero-title">Both green.<br />One losing<span className={styles.period}>.</span></h1>
          <p className={styles.description}>Up feels like winning.<br />Until you see what the market did.</p>
          <p className={styles.explanation}>Put your stocks in context. Watchlist shows what’s actually beating the market — and what’s just along for the ride.</p>
          <div className={styles.actions}>
            <Link href={watchlistEntryUrl} className={styles.primary}>Go to watchlist <span aria-hidden="true">↗</span></Link>
            <a href={sourceUrl} className={styles.source}>View source code <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <div className={styles.visual}>
          <LandingIllustration />
        </div>
      </main>

    </div>
  );
}
