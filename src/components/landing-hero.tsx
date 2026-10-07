import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { landingComparison } from "@/lib/landing-comparison";
import { formatPct } from "@/lib/format";
import styles from "./landing-hero.module.css";

type Point = readonly [number, number];

const { stockReturns, benchmarkReturns, stockReturn, benchmarkReturn, gapPp } = landingComparison;
// One zero and one scale for both lines, so the space between them is the real gap.
const scaleMax = Math.ceil(Math.max(...stockReturns, ...benchmarkReturns) / 5) * 5;
const toY = (value: number) => 100 - value / scaleMax * 100;
const toPoints = (returns: number[]): Point[] => returns.map((value, index) => [index / (returns.length - 1) * 100, toY(value)]);

// Catmull-Rom through every month, so each line passes through the data rather than near it.
function curve(points: Point[]) {
  return points.slice(1).map(([x, y], index) => {
    const before = points[Math.max(index - 1, 0)];
    const [fromX, fromY] = points[index];
    const after = points[Math.min(index + 2, points.length - 1)];
    const c1 = [fromX + (x - before[0]) / 6, fromY + (y - before[1]) / 6];
    const c2 = [x - (after[0] - fromX) / 6, y - (after[1] - fromY) / 6];
    return `C${c1.map(n => n.toFixed(2)).join(" ")} ${c2.map(n => n.toFixed(2)).join(" ")} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

const stock = toPoints(stockReturns);
const market = toPoints(benchmarkReturns);
const stockPath = `M${stock[0].join(" ")} ${curve(stock)}`;
const marketPath = `M${market[0].join(" ")} ${curve(market)}`;
const reversedMarket = [...market].reverse();
// Everything the market made that the stock did not, across the whole year.
const shortfallPath = `${stockPath} L${reversedMarket[0].join(" ")} ${curve(reversedMarket)} Z`;
const stockAreaPath = `${stockPath} L100 100 L0 100 Z`;
const ends = { "--stock-y": `${toY(stockReturn)}%`, "--market-y": `${toY(benchmarkReturn)}%` } as CSSProperties;

export function LandingHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.lead}>
        <h1 id="hero-title">Both green.<br />One losing<span>.</span></h1>
        <div className={styles.aside}>
          <p>Up feels like winning.<br />Until you see what the market did.</p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primary}>Go to watchlist <ArrowUpRight size={19} aria-hidden="true" /></Link>
            <a href="https://github.com/vojtechbalcar/Watchlist" className={styles.source}>View source code <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </div>

      <figure className={styles.race}>
        <div className={styles.plot} style={ends}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="hero-stock-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" className={styles.fadeTop} />
                <stop offset="1" className={styles.fadeBottom} />
              </linearGradient>
            </defs>
            <path className={styles.stockArea} d={stockAreaPath} />
            <path className={styles.shortfall} d={shortfallPath} />
            <path className={styles.marketLine} d={marketPath} vectorEffect="non-scaling-stroke" />
            <path className={styles.stockLine} d={stockPath} vectorEffect="non-scaling-stroke" />
          </svg>
          <span className={styles.origin} aria-hidden="true" />
          <span className={`${styles.dot} ${styles.marketDot}`} aria-hidden="true" />
          <span className={`${styles.dot} ${styles.stockDot}`} aria-hidden="true" />
          <p className={styles.marketEnd}>{formatPct(benchmarkReturn, 1)}<span>S&amp;P 500</span></p>
          <p className={styles.stockEnd}>{formatPct(stockReturn, 1)}<span>Your stock</span></p>
          <p className={styles.gap}><strong>−{Math.abs(gapPp).toFixed(1)} pp</strong><span>behind the market</span></p>
        </div>
        <figcaption>One year from the same starting point. Illustrative returns.</figcaption>
      </figure>
    </section>
  );
}
