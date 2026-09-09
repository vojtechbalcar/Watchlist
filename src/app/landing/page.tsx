import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { LandingIllustration } from "@/components/landing-illustration";
import { BenchmarkSpark } from "@/components/benchmark-spark";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Watchlist — Your stocks. In context.",
  description: "Is your stock beating its benchmark, or just moving with it? See the difference with Watchlist.",
};

const sourceUrl = "https://github.com/vojtechbalcar/Watchlist";
// Temporary entry point until auth and onboarding state determine the destination.
const watchlistEntryUrl = "/register";

// NVDA is marked the same way the illustration marks it: brand, not direction.
const tickers = [
  { symbol: "AAPL", selected: false },
  { symbol: "NVDA", selected: true },
  { symbol: "MSFT", selected: false },
];

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
          <h2 id="compare-title">Measured against<br />the market</h2>
          <p className={styles.cardLegend}>
            <span className={styles.keyStock} aria-hidden="true" />Your stock
            <span className={styles.keyBenchmark} aria-hidden="true" />S&amp;P 500
          </p>
          <BenchmarkSpark />
        </section>

        <section className={styles.tickerCard} aria-labelledby="tickers-title">
          <h2 id="tickers-title">Your stocks,<br />one list</h2>
          <p className={styles.tickerRow}>
            {tickers.map(({ symbol, selected }) => (
              <span key={symbol} className={selected ? `${styles.ticker} ${styles.tickerSelected}` : styles.ticker}>{symbol}</span>
            ))}
            <span className={styles.tickerMore}>+ any listed stock</span>
          </p>
        </section>
      </main>

    </div>
  );
}
