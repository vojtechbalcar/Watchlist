/* eslint-disable @next/next/no-html-link-for-pages -- Recovery links must work without the app router, including in global-error. */
import type { ReactNode, Ref } from "react";
import { Wordmark } from "./wordmark";
import styles from "./recovery-screen.module.css";

type RecoveryScreenProps = {
  label: string;
  title: string;
  description: string;
  headingRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
};

/** Keep recovery independent of market data, browser storage, and app providers. */
export function RecoveryScreen({ label, title, description, headingRef, children }: RecoveryScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <a href="/" aria-label="Watchlist dashboard"><Wordmark className={styles.wordmark} /></a>
        <span>Your stocks. In context.</span>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.label}>{label}</p>
          <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined}>{title}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>{children}</div>
          <nav className={styles.navigation} aria-label="Recovery links">
            <a href="/explore">Explore stocks <span aria-hidden="true">↗</span></a>
            <a href="/watchlist">Your watchlist <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </main>
    </div>
  );
}
