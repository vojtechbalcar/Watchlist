import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { LandingHero } from "@/components/landing-hero";
import { LandingAppTour } from "@/components/landing-app-tour";
import { WatchlistEntryLink } from "@/components/watchlist-entry-link";
import buttons from "@/components/landing-buttons.module.css";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Watchlist — Your stocks. In context.",
  description: "Is your stock beating its benchmark, or just moving with it? See the difference with Watchlist.",
};

const sourceUrl = "https://github.com/vojtechbalcar/Watchlist";

// New accounts return to the same setup entry as every watchlist call to action.
const registerUrl = `/register?${new URLSearchParams({ callbackUrl: "/watchlist?setup=continue" })}`;

type FooterLink = { label: string; href: string; external?: boolean };

const footerGroups: { title: string; links: FooterLink[] }[] = [
  { title: "On this page", links: [{ label: "The app", href: "#inside-watchlist" }, { label: "How it works", href: "#getting-started" }] },
  { title: "Account", links: [{ label: "Sign in", href: "/login" }, { label: "Create an account", href: registerUrl }] },
  { title: "Project", links: [{ label: "Source code", href: sourceUrl, external: true }, { label: "Report an issue", href: `${sourceUrl}/issues`, external: true }, { label: "Privacy", href: "/privacy" }] },
];

const steps = [
  { title: "Make it yours.", text: "Create an account and start with the companies you want to follow." },
  { title: "Bring in the context.", text: "See stock returns alongside the market and their sector benchmarks." },
  { title: "Keep your perspective.", text: "Come back to a clear view of what’s ahead, what’s behind, and what’s changed." },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Landing navigation">
          <Link href="/landing" aria-label="Watchlist home" className={styles.home}><Wordmark className={styles.wordmark} /></Link>
          <div className={styles.links}>
            <a href="#inside-watchlist" className={styles.wideLink}>The app</a>
            <a href={sourceUrl} className={styles.wideLink}>Source code <span aria-hidden="true">↗</span></a>
            <Link href="/login" className={styles.signIn}>Sign in</Link>
          </div>
          <WatchlistEntryLink className={`${buttons.pill} ${buttons.primary} ${styles.navCta}`}>Go to watchlist</WatchlistEntryLink>
        </nav>
      </header>

      <main id="main-content">
        <LandingHero />

        <section className={styles.section} aria-labelledby="context-title">
          <div className={styles.statement}>
            <h2 id="context-title">A return is only half the story.</h2>{" "}
            <p>A stock can be up and still fall behind. Watchlist sets each one against its benchmark, so you can see who’s leading and who’s only moving with the market.</p>
          </div>
        </section>

        <LandingAppTour />

        <section id="getting-started" className={styles.section} aria-labelledby="getting-started-title">
          <h2 id="getting-started-title" className={styles.heading}>Less noise. More perspective.</h2>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${styles.section} ${styles.closing}`} aria-labelledby="closing-title">
          <h2 id="closing-title" className={styles.closingTitle}>See the difference for yourself<span className={styles.period}>.</span></h2>
          <p className={styles.sectionLead}>Your next move starts with context.</p>
          <WatchlistEntryLink className={`${buttons.pill} ${buttons.large} ${buttons.primary} ${styles.closingCta}`}>Create your watchlist</WatchlistEntryLink>
          <p className={styles.signInNote}>Already have an account? <Link href="/login">Sign in</Link></p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <Link href="/landing" aria-label="Watchlist home" className={styles.home}><Wordmark className={styles.wordmark} /></Link>
            <p>Your stocks. In context.</p>
          </div>
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className={styles.footerTitle}>{group.title}</p>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/")
                        ? <Link href={link.href}>{link.label}</Link>
                        : <a href={link.href}>{link.label}{link.external ? <> <span aria-hidden="true">↗</span></> : null}</a>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p>Product visuals use illustrative data. Company logos belong to their owners.</p>
          <p>Made for a little more perspective.</p>
        </div>
      </footer>
    </div>
  );
}
