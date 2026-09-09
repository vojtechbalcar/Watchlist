import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { LandingIllustration } from "@/components/landing-illustration";
import { BenchmarkSpark } from "@/components/benchmark-spark";
import { landingComparison } from "@/lib/landing-comparison";
import { formatPct } from "@/lib/format";
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
        <section className={styles.showcase} aria-labelledby="hero-title">
          <div className={styles.copy}>
            <h1 id="hero-title">Both green.<br />One losing<span className={styles.period}>.</span></h1>
            <p className={styles.description}>Up feels like winning.<br />Until you see what the market did.</p>
            <div className={styles.actions}>
              <Link href={watchlistEntryUrl} className={styles.primary}>Go to watchlist <span aria-hidden="true">↗</span></Link>
              <a href={sourceUrl} className={styles.source}>View source code <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className={styles.visual}>
            <LandingIllustration />
          </div>
        </section>

        <section className={styles.compareCard} aria-labelledby="compare-title">
          <div className={styles.compareHeading}>
            <h2 id="compare-title">Measured against<br />the market</h2>
            <span className={styles.comparePeriod}>1Y</span>
          </div>
          <dl className={styles.comparisonMetrics}>
            <div>
              <dt><span className={styles.keyStock} aria-hidden="true" />Your stock</dt>
              <dd>{formatPct(landingComparison.stockReturn, 1)}</dd>
            </div>
            <div>
              <dt><span className={styles.keyBenchmark} aria-hidden="true" />S&amp;P 500</dt>
              <dd>{formatPct(landingComparison.benchmarkReturn, 1)}</dd>
            </div>
          </dl>
          <BenchmarkSpark />
          <div className={styles.relativePerformance}>
            <span>Behind the S&amp;P 500</span>
            <strong>−{Math.abs(landingComparison.gapPp).toFixed(1)}<span> pp</span></strong>
          </div>
          <p className={styles.chartNote}>Illustrative 1-year returns</p>
        </section>

        <Link href={watchlistEntryUrl} className={styles.ctaCard} aria-labelledby="start-title start-action">
          <h2 id="start-title">Start your<br />watchlist.</h2>
          <span className={styles.cardAction}>
            <span id="start-action">Create an account</span>
            <ArrowUpRight size={32} strokeWidth={1.5} aria-hidden="true" />
          </span>
        </Link>
      </main>

    </div>
  );
}
