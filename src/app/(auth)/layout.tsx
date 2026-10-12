import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import styles from "@/components/auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/landing" aria-label="Watchlist home"><Wordmark className={styles.wordmark} /></Link>
        <Link href="/landing" className={styles.demoLink}>About watchlist <span aria-hidden="true">↗</span></Link>
      </header>
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>A clearer view of the market</p>
          <h2>Your stocks.<br />In context<span className={styles.period}>.</span></h2>
          <p className={styles.introCopy}>See how the stocks you follow measure up against their benchmark. Keep the bigger picture in view.</p>
          <p className={styles.introFoot}>A little less noise.<br />A little more perspective.</p>
        </div>
        <div className={styles.formPanel}>{children}</div>
      </main>
      <footer className={styles.footer}><span>Made for watching.</span><span>watchlist</span></footer>
    </div>
  );
}
