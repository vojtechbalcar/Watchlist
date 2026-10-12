import Image from "next/image";
import type { CSSProperties } from "react";
import { WatchlistEntryLink } from "./watchlist-entry-link";
import { landingComparison } from "@/lib/landing-comparison";
import { stockLogoFit, stockLogoSrc } from "@/lib/stock-logos";
import buttons from "./landing-buttons.module.css";
import styles from "./landing-hero.module.css";

type Placement = {
  /** Which ring it travels, counted out from the market. */
  ring: 1 | 2 | 3 | 4;
  /** Degrees from straight up; negative is left of the market. */
  angle: number;
};

type Orbiter = Placement & {
  ticker: string;
  size: "s" | "m" | "l";
  /** Where it sits once the hero narrows to one column; without one it is left out there. */
  narrow?: Placement;
};

// An illustration, not data: familiar companies held in the market's orbit.
const orbiters: Orbiter[] = [
  { ticker: "AAPL", ring: 1, angle: -63, size: "l", narrow: { ring: 1, angle: -52 } },
  { ticker: "MSFT", ring: 2, angle: -49, size: "m" },
  { ticker: "NVDA", ring: 3, angle: -37, size: "l" },
  { ticker: "GOOGL", ring: 3, angle: -66, size: "s", narrow: { ring: 2, angle: -36 } },
  { ticker: "AMZN", ring: 4, angle: -50, size: "m" },
  { ticker: "META", ring: 1, angle: 59, size: "m", narrow: { ring: 1, angle: 53 } },
  { ticker: "V", ring: 2, angle: 43, size: "s" },
  { ticker: "JPM", ring: 3, angle: 34, size: "m" },
  { ticker: "NKE", ring: 3, angle: 62, size: "l", narrow: { ring: 2, angle: 36 } },
  { ticker: "ADBE", ring: 4, angle: 47, size: "s" },
  { ticker: "TSLA", ring: 2, angle: 77, size: "s" },
];

function placementStyle({ ring, angle, narrow }: Orbiter, order: number) {
  return {
    "--ring": ring,
    "--angle": `${angle}deg`,
    ...(narrow ? { "--narrow-ring": narrow.ring, "--narrow-angle": `${narrow.angle}deg` } : {}),
    "--order": order,
  } as CSSProperties;
}
const rings = [1, 2, 3, 4] as const;

// The market at the centre is the S&P 500's illustrative year, opened like a fan of swatches: one petal a month
// from January on the left to December on the right, each as long as the year's return so far and a shade darker.
const hubReach = 0.3;
const tipRounding = 0.035;
const { benchmarkReturns, benchmarkReturn } = landingComparison;
const point = (distance: number, radians: number) => `${(distance * Math.sin(radians)).toFixed(4)} ${(-distance * Math.cos(radians)).toFixed(4)}`;
const petals = benchmarkReturns.slice(1).map((value, month) => {
  const reach = 0.46 + 0.54 * value / benchmarkReturn;
  const [from, to] = [month * 15 - 90, month * 15 - 75].map(degrees => degrees * Math.PI / 180);
  const turn = tipRounding / reach;
  // Straight sides out from the centre, an arc across the tip, and softly rounded tip corners.
  const path = `M0 0L${point(reach - tipRounding, from)}Q${point(reach, from)} ${point(reach, from + turn)}`
    + `A${reach.toFixed(4)} ${reach.toFixed(4)} 0 0 1 ${point(reach, to - turn)}Q${point(reach, to)} ${point(reach - tipRounding, to)}Z`;
  return { month, path };
});

export function LandingHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.lead}>
        <h1 id="hero-title">Both green.<br />One losing<span className={styles.period}>.</span></h1>
        <p>Up feels like winning.<br />Until you see what the market did.</p>
        <div className={styles.actions}>
          <WatchlistEntryLink className={`${buttons.pill} ${buttons.large} ${buttons.primary}`}>Go to watchlist</WatchlistEntryLink>
          <a href="https://github.com/vojtechbalcar/Watchlist" className={`${buttons.pill} ${buttons.large} ${buttons.soft}`}>View source code <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div className={styles.orbit} aria-hidden="true">
        {rings.map(ring => <span key={ring} className={styles.ring} style={{ "--ring": ring } as CSSProperties} />)}
        <svg className={styles.fan} viewBox="-1 -1 2 1">
          {petals.map(petal => <path key={petal.month} className={styles.petal} d={petal.path} vectorEffect="non-scaling-stroke" style={{ "--month": petal.month, "--shade": `${Math.round(16 + petal.month * 7.6)}%` } as CSSProperties} />)}
          <circle className={styles.hub} r={hubReach} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={styles.hubLabel}>S&amp;P 500</span>
        {orbiters.map((orbiter, index) => {
          const src = stockLogoSrc(orbiter.ticker);
          return (
            <span
              key={orbiter.ticker}
              className={styles.tile}
              data-size={orbiter.size}
              data-fit={stockLogoFit(orbiter.ticker)}
              data-narrow={orbiter.narrow ? "" : undefined}
              style={placementStyle(orbiter, index)}
            >
              {src ? <Image src={src} alt="" width={40} height={40} loading="eager" /> : null}
            </span>
          );
        })}
      </div>
    </section>
  );
}
