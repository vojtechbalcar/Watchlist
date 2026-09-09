import styles from "@/app/landing/landing.module.css";
import { landingComparison } from "@/lib/landing-comparison";

/**
 * Two illustrative one-year paths for the brand card: both climb, and the
 * benchmark stays above. The lines carry identity, not direction — which is why
 * neither uses green or red, and why the maroon behind them stays brand only.
 */
export function BenchmarkSpark() {
  const { stockReturns, benchmarkReturns, stockReturn, benchmarkReturn, gapPp } = landingComparison;
  const chartY = (value: number) => 140 - value / 25 * 128;
  const points = (values: number[]) => values.map((value, index) => [12 + index / (values.length - 1) * 292, chartY(value)]);
  const serialize = (coordinates: number[][]) => coordinates.map(point => point.join(",")).join(" ");
  const stockPoints = points(stockReturns);
  const benchmarkPoints = points(benchmarkReturns);

  return (
    <svg className={styles.spark} viewBox="0 0 360 174" role="img" aria-labelledby="spark-title spark-description">
      <title id="spark-title">Your stock compared with the S&amp;P 500 over one illustrative year</title>
      <desc id="spark-description">Both series start at zero. Your stock returns {stockReturn} percent and the benchmark returns {benchmarkReturn} percent, leaving the stock {Math.abs(gapPp)} percentage points behind. Values are illustrative, not live market data.</desc>

      <g fill="var(--color-brand-foreground)" fontSize="11">
        {[0, 10, 20].map(value => (
          <g key={value}>
            <line x1="12" x2="304" y1={chartY(value)} y2={chartY(value)} stroke="currentColor" strokeOpacity=".18" strokeDasharray={value === 0 ? undefined : "3 5"} />
            <text x="352" y={chartY(value) + 4} textAnchor="end">{value}%</text>
          </g>
        ))}
        <text x="12" y="168">Start</text>
        <text x="158" y="168" textAnchor="middle">6 months</text>
        <text x="304" y="168" textAnchor="end">1 year</text>
      </g>

      <polygon points={serialize([...benchmarkPoints, ...stockPoints.toReversed()])} fill="var(--color-brand-foreground)" fillOpacity=".08" />
      <polyline points={serialize(benchmarkPoints)} fill="none" stroke="var(--color-brand-foreground)" strokeOpacity=".72" strokeDasharray="5 5" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={serialize(stockPoints)} fill="none" stroke="var(--color-brand-foreground)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />

      <circle cx="304" cy={chartY(benchmarkReturn)} r="3.5" fill="var(--color-brand)" stroke="var(--color-brand-foreground)" strokeOpacity=".72" strokeWidth="2" />
      <circle cx="304" cy={chartY(stockReturn)} r="4" fill="var(--color-brand-foreground)" />
    </svg>
  );
}
