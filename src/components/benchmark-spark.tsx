import styles from "@/app/landing/landing.module.css";

/**
 * Two illustrative one-year paths for the brand card: both climb, and the
 * benchmark stays above. The lines carry identity, not direction — which is why
 * neither uses green or red, and why the maroon behind them stays brand only.
 */
export function BenchmarkSpark() {
  return (
    <svg className={styles.spark} viewBox="0 0 300 200" role="img" aria-labelledby="spark-title">
      <title id="spark-title">An illustrative year: the benchmark climbs above the stock, and stays there.</title>

      {/* Drop lines give the paths a floor without drawing an axis. */}
      <g stroke="var(--color-brand-foreground)" strokeOpacity=".2" strokeWidth="1">
        <path d="M62 118v82M170 84v116M292 28v172" />
      </g>

      <path d="M8 146 62 118 116 130 170 84 224 94 292 28" fill="none" stroke="var(--color-brand-foreground)" strokeOpacity=".4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M8 160 62 140 116 150 170 116 224 124 292 66" fill="none" stroke="var(--color-brand-foreground)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />

      <circle cx="292" cy="28" r="4.5" fill="var(--color-brand)" stroke="var(--color-brand-foreground)" strokeOpacity=".4" strokeWidth="2" />
      <circle cx="292" cy="66" r="5" fill="var(--color-brand-foreground)" />
    </svg>
  );
}
