import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <header className="auth-header">
        <Link href="/" aria-label="Watchlist home"><Wordmark className="h-auto w-[122px]" /></Link>
        <Link href="/" className="auth-demo-link">Explore the demo <span aria-hidden="true">↗</span></Link>
      </header>
      <main className="auth-main">
        <div className="auth-intro">
          <p className="eyebrow">A clearer view of the market</p>
          <h2>Moving up.<br />But <span>beating<br className="auth-heading-break" /> the market?</span></h2>
          <p className="auth-intro-copy">See how the stocks you follow measure up against their benchmark. Keep the bigger picture in view.</p>
          <div className="auth-intro-foot"><span className="auth-brand-rule" />Your stocks. In context.</div>
        </div>
        <div className="auth-form-panel">{children}</div>
      </main>
      <footer className="auth-footer"><span>A little less noise. A little more perspective.</span><span>watchlist</span></footer>
    </div>
  );
}
