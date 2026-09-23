import { comparisonDomain, comparisonY } from "@/lib/compare-chart";
import { explorePerformance, exploreRanges, type ExploreRange } from "@/lib/explore-performance";
import { benchmarkFor, type ExploreStock } from "@/lib/explore-data";
import { formatPct } from "@/lib/format";
import styles from "./stock-detail.module.css";

/** Period totals are comparable observations, not a fabricated price history. */
export function StockReturnChart({ stock, range }: { stock: ExploreStock; range: ExploreRange }) {
  const periods = exploreRanges.map(period => ({ period, performance: explorePerformance(stock, period) }));
  const domain = comparisonDomain(periods.flatMap(({ performance }) => performance ? [performance.stockReturn, performance.benchmarkReturn] : []));
  const zero = comparisonY(0, domain);
  return <figure className={styles.chart}>
    <svg viewBox="0 0 760 260" role="img" aria-label={`${stock.ticker} and ${benchmarkFor(stock)} returns by period. Exact values follow in the performance table.`}>
      {[0, 1, 2, 3, 4].map(step => {
        const value = domain.min + (domain.max - domain.min) * step / 4;
        const y = comparisonY(value, domain);
        return <g key={step}><line x1="12" x2="688" y1={y} y2={y} stroke="var(--color-line)" strokeDasharray="3 5" /><text x="750" y={y + 4} textAnchor="end">{Number(value.toFixed(1))}%</text></g>;
      })}
      <line x1="12" x2="688" y1={zero} y2={zero} stroke="var(--color-text-faint)" />
      {periods.map(({ period, performance }, index) => {
        const x = 35 + index * 136;
        return <g key={period}>
          {range === period && <rect x={x - 15} y="10" width="116" height="218" rx="4" fill="var(--color-surface-sunken)" opacity=".65" />}
          {performance && [performance.stockReturn, performance.benchmarkReturn].map((value, series) => {
            const y = comparisonY(value, domain);
            return <rect key={series} x={x + series * 41} y={Math.min(zero, y)} width="32" height={Math.max(1, Math.abs(y - zero))} rx="2" fill={series === 0 ? "var(--color-ink)" : "var(--color-chart-benchmark)"} opacity={range === period ? 1 : .55}>
              <title>{`${series === 0 ? stock.ticker : benchmarkFor(stock)} · ${period}: ${formatPct(value)}`}</title>
            </rect>;
          })}
          {!performance && <text x={x + 36} y="126" textAnchor="middle">—</text>}
          <text x={x + 36} y="252" textAnchor="middle" className={range === period ? styles.activeLabel : undefined}>{period}</text>
        </g>;
      })}
    </svg>
    <figcaption className="chart-caption"><span>Returns by period · {stock.currency}</span><span>Sample returns</span></figcaption>
  </figure>;
}
