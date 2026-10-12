"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { Check } from "lucide-react";
import { WatchlistEntryLink } from "./watchlist-entry-link";
import { LandingProductPreview } from "./landing-product-preview";
import buttons from "./landing-buttons.module.css";
import styles from "./landing-app-tour.module.css";

const pages = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Start with the bigger picture.",
    description: "Your watchlist and the market, in one view. See how they’re moving together, where they’re pulling apart, and what’s driving the day.",
    details: ["Watchlist performance against the S&P 500", "The day’s biggest gainers and decliners"],
    alt: "Illustration of watchlist and S&P 500 returns on a shared chart, with the difference shown in percentage points.",
  },
  {
    id: "watchlist",
    label: "Watchlist",
    title: "Your stocks. Every detail in context.",
    description: "Keep the companies you care about in one place. Look beyond a green number and see which stocks are actually ahead of their benchmark.",
    details: ["Price, returns, and benchmark gaps side by side", "Search, sort, and filter for who’s ahead or behind"],
    alt: "Illustration of three stocks with positive and negative benchmark gaps labeled Ahead or Behind.",
  },
  {
    id: "compare",
    label: "Compare",
    title: "Put performance side by side.",
    description: "A shared starting point makes the difference clear. Compare stocks over the same period and see how each one measures up against the market.",
    details: ["Stock and benchmark performance on one chart", "A ranking and comparison table for the finer details"],
    alt: "Illustration of NVIDIA, Microsoft, and S&P 500 returns, with all three chart lines starting at zero.",
  },
  {
    id: "explore",
    label: "Explore",
    title: "Find your next one to follow.",
    description: "Take a look beyond your usual names. Browse by sector, see how companies compare with their market, and add the ones that catch your attention.",
    details: ["Sector benchmarks and market breadth at a glance", "Search for companies and add them to your watchlist"],
    alt: "Illustration of company discovery with sectors, three technology companies, and watchlist membership marks.",
  },
] as const;

export function LandingAppTour() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function move(direction: number) {
    setActiveIndex((current) => (current + direction + pages.length) % pages.length);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight": nextIndex = (index + 1) % pages.length; break;
      case "ArrowLeft": nextIndex = (index - 1 + pages.length) % pages.length; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = pages.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActiveIndex(nextIndex);
    tabs.current[nextIndex]?.focus();
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  }

  return (
    <section id="inside-watchlist" className={styles.tour} aria-labelledby="app-tour-title">
      <h2 id="app-tour-title">Everything in view. Nothing in the way.</h2>
      <p className={styles.introduction}>One watchlist. Four useful perspectives.</p>

      <div className={styles.tabs} role="tablist" aria-label="App previews">
        {pages.map((page, index) => (
          <button
            key={page.id}
            ref={(element) => { tabs.current[index] = element; }}
            id={`tour-tab-${page.id}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls={`tour-panel-${page.id}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => handleTabKey(event, index)}
          >
            {page.label}
          </button>
        ))}
      </div>

      {pages.map((page, index) => (
        <div
          key={page.id}
          id={`tour-panel-${page.id}`}
          role="tabpanel"
          aria-labelledby={`tour-tab-${page.id}`}
          tabIndex={0}
          hidden={index !== activeIndex}
          className={styles.panel}
        >
          <div className={styles.copy}>
            <h3>{page.title}</h3>
            <p className={styles.description}>{page.description}</p>
            <ul className={styles.details}>
              {page.details.map((detail) => <li key={detail}><Check size={16} strokeWidth={2} aria-hidden="true" />{detail}</li>)}
            </ul>
            <WatchlistEntryLink className={`${buttons.pill} ${buttons.primary} ${styles.cta}`}>Make it your watchlist</WatchlistEntryLink>
          </div>

          <figure
            className={styles.preview}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStart.current = null; }}
          >
            <LandingProductPreview page={page.id} />
            <figcaption><span className="sr-only">{page.alt} </span>Simplified view with illustrative data.</figcaption>
          </figure>
        </div>
      ))}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{pages[activeIndex].label}, {activeIndex + 1} of {pages.length}</p>
    </section>
  );
}
