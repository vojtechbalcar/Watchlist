import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy | Watchlist",
  description: "What Watchlist stores about you, where, and how to delete it.",
};

const sourceUrl = "https://github.com/vojtechbalcar/Watchlist";

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/landing" aria-label="Watchlist home"><Wordmark className={styles.wordmark} /></Link>
      </header>
      <main className={styles.main}>
        <h1>Privacy<span className={styles.period}>.</span></h1>
        <p className={styles.lead}>Watchlist keeps only what it needs to sign you in and remember your stocks. It has no ads, no analytics, and no tracking cookies.</p>

        <section>
          <h2>What is stored with your account</h2>
          <ul>
            <li>Your email address, used to sign you in.</li>
            <li>Your password, stored only as a salted scrypt hash. Nobody can read it back.</li>
            <li>Your watchlist: the stocks you saved and any unfinished setup.</li>
            <li>Your preferences, including the optional display name you set in Settings.</li>
          </ul>
          <p>These live in a Prisma Postgres database. The app runs on Cloudflare Workers.</p>
        </section>

        <section>
          <h2>What stays in your browser</h2>
          <ul>
            <li>A signed session cookie that keeps you logged in. It is required for the app to work.</li>
            <li>A working copy of your watchlist and preferences in local storage, so the app works while it syncs.</li>
          </ul>
        </section>

        <section>
          <h2>Security records</h2>
          <p>To slow down password guessing and bulk sign-ups, Watchlist counts sign-in and registration attempts per email address and per network address. Those counts expire after 15 minutes for sign-in and an hour for registration.</p>
        </section>

        <section>
          <h2>Market data</h2>
          <p>Prices come from Twelve Data. The server requests them; nothing about you is sent. For a stock outside the tracked set, your browser may load that company’s logo directly from Twelve Data.</p>
        </section>

        <section>
          <h2>Deleting your data</h2>
          <p>You can delete your account at any time in Settings, under Data &amp; preferences. That removes your account, watchlist, and preferences from the database at once. Signing out and clearing this site’s data removes the browser copy.</p>
          <p>Questions? Open an issue on <a href={`${sourceUrl}/issues`}>GitHub</a>.</p>
        </section>
      </main>
      <footer className={styles.footer}><Link href="/landing">Back to Watchlist</Link></footer>
    </div>
  );
}
