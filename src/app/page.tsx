import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { LandingComparison } from "@/components/landing-comparison";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Watchlist | Stock performance, in context",
  description: "Is your stock beating its benchmark, or just moving with it? Follow your watchlist, compare returns, and see the difference.",
};

const destinations = [
  { number: "01", title: "Your watchlist", text: "The stocks you follow. The context that matters.", href: "/watchlist" },
  { number: "02", title: "Compare", text: "Stocks and their benchmark, side by side.", href: "/compare" },
  { number: "03", title: "Explore", text: "A closer look at the companies in each sector.", href: "/explore" },
];

const questions = [
  {
    question: "What does beating the benchmark mean?",
    answer: "It means a stock returned more than its benchmark over the same period. If a stock gains 8% and its benchmark gains 5%, the stock is ahead by 3 percentage points. A positive return alone doesn't tell you that.",
  },
  {
    question: "Is this live market data?",
    answer: "Not yet. The current app uses illustrative stock prices, returns, and chart histories. They're there to let you explore the experience, and aren't live market quotes.",
  },
  {
    question: "Do I need an account?",
    answer: "No account is needed to explore the current demo. Open the watchlist to try the dashboard, compare stocks, and browse sectors.",
  },
  {
    question: "Will my watchlist changes be saved?",
    answer: "The demo keeps additions and removals only in the current view. They reset when you leave or reload that view, and aren't shared between pages. Saved watchlists aren't available yet.",
  },
];

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <a className={styles.skipLink} href="#main">Skip to content</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="Watchlist home"><Wordmark className={styles.wordmark} /></Link>
          <nav className={styles.navigation} aria-label="Landing page">
            <a href="#benchmark">The benchmark</a>
            <a href="#questions">Questions</a>
          </nav>
          <Link href="/dashboard" className={styles.headerAction}>
            Open watchlist <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <p className={styles.label}>Stock performance, in context</p>
            <h1 id="hero-title">Watchlist<span>.</span></h1>
            <p className={styles.heroDescription}>Is your stock beating the market,<br className={styles.desktopBreak} /> or just moving with it?</p>
            <div className={styles.heroActions}>
              <Link href="/dashboard" className={styles.primaryButton}>Open watchlist <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <a href="#benchmark" className={styles.textLink}>See the difference <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <p className={styles.heroNote}>Explore the demo. No account needed.</p>
          </div>
          <div className={styles.heroImage} role="img" aria-label="Watchlist demo dashboard showing returns against the S&P 500" />
          <a className={styles.previewLink} href="/dashboard" aria-label="Open the dashboard shown in the preview">
            Dashboard preview <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <span className={styles.previewNote}>Illustrative data</span>
        </section>

        <section id="benchmark" className={styles.benchmarkSection} aria-labelledby="benchmark-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div><p className={styles.label}>Beyond the green number</p><h2 id="benchmark-title">A gain isn&apos;t the whole story.</h2></div>
              <p>The market moves. Your stocks move.<br /> What matters is the difference.</p>
            </div>
            <LandingComparison />
            <Link href="/compare" className={styles.sectionLink}>Open the full comparison <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className={styles.workflowSection} aria-label="Explore Watchlist">
          <div className={styles.destinations}>
            {destinations.map((destination) => (
              <Link href={destination.href} key={destination.href} className={styles.destination}>
                <span className={styles.destinationNumber}>{destination.number}</span>
                <div><h2>{destination.title}</h2><p>{destination.text}</p></div>
                <ArrowUpRight size={22} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section id="questions" className={styles.questionsSection} aria-labelledby="questions-title">
          <div className={styles.questionsInner}>
            <div><p className={styles.label}>A few things to know</p><h2 id="questions-title">Before you dive in.</h2></div>
            <div className={styles.questions}>
              {questions.map(({ question, answer }) => (
                <details key={question}>
                  <summary>{question}<Plus size={18} aria-hidden="true" /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <div className={styles.closingInner}>
            <div><p className={styles.label}>Less noise. More perspective.</p><h2 id="closing-title">Put your watchlist<br />in context.</h2></div>
            <Link href="/dashboard" className={styles.primaryButton}>Open watchlist <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" aria-label="Watchlist home"><Wordmark className={styles.wordmark} /></Link>
          <span>Stock performance, in context.</span>
          <a href="#questions">About the demo <ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
}
