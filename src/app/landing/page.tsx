import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Minus, Equal } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { LandingIllustration } from "@/components/landing-illustration";
import { BenchmarkSpark } from "@/components/benchmark-spark";
import { LandingAppTour } from "@/components/landing-app-tour";
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

const steps = [
  { title: "Make it yours.", text: "Create an account and start with the companies you want to follow." },
  { title: "Bring in the context.", text: "See stock returns alongside the market and their sector benchmarks." },
  { title: "Keep your perspective.", text: "Come back to a clear view of what’s ahead, what’s behind, and what’s changed." },
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

      <main id="main-content">
        <div className={styles.hero}>
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
        </div>

        <section className={styles.context} aria-labelledby="context-title">
          <div className={styles.contextCopy}>
            <p className={styles.eyebrow}>It’s all relative</p>
            <h2 id="context-title">A return is only<br />half the story.</h2>
            <p>A stock can be up and still fall behind. The benchmark tells you the difference.</p>
          </div>
          <div className={styles.equationWrap}>
            <div className={styles.equation}>
              <dl><dt>Your stock</dt><dd className={styles.positive}>{formatPct(landingComparison.stockReturn, 1)}</dd></dl>
              <Minus className={styles.operator} size={20} aria-hidden="true" />
              <dl><dt>S&amp;P 500</dt><dd className={styles.positive}>{formatPct(landingComparison.benchmarkReturn, 1)}</dd></dl>
              <Equal className={styles.operator} size={20} aria-hidden="true" />
              <dl className={styles.gapMetric}><dt>Behind the market</dt><dd>−{Math.abs(landingComparison.gapPp).toFixed(1)}<small> pp</small></dd></dl>
            </div>
            <p className={styles.exampleNote}>Same year. Same starting point. <span>Illustrative returns.</span></p>
          </div>
        </section>

        <LandingAppTour />

        <section id="getting-started" className={styles.gettingStarted} aria-labelledby="getting-started-title">
          <div className={styles.stepsHeading}>
            <p className={styles.eyebrow}>A simpler routine</p>
            <h2 id="getting-started-title">Less noise.<br />More perspective.</h2>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <div><p className={styles.closingLabel}>Your next move starts with context.</p><h2 id="closing-title">See the difference<br />for yourself<span>.</span></h2></div>
          <div className={styles.closingActions}>
            <Link href={watchlistEntryUrl} className={styles.lightCta}>Create your watchlist <ArrowUpRight size={20} aria-hidden="true" /></Link>
            <p>Already have an account? <Link href="/login">Sign in</Link></p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div><Link href="/landing" aria-label="Watchlist home"><Wordmark className={styles.footerWordmark} /></Link><p>Your stocks. In context.</p></div>
          <nav aria-label="Footer navigation"><a href="#inside-watchlist">The app</a><Link href="/login">Sign in</Link><a href={sourceUrl}>View source <ArrowUpRight size={14} aria-hidden="true" /></a></nav>
        </div>
        <div className={styles.footerBottom}><span>Made for a little more perspective.</span><span>Product visuals use illustrative data.</span></div>
      </footer>
    </div>
  );
}
