import { compareBenchmark, type CompareRow, type CompareRange } from "@/lib/compare-data";
import { comparisonDomain, comparisonPoints, comparisonY } from "@/lib/compare-chart";
const labels: Record<CompareRange, string[]> = {
  "1D": ["09:30", "11:30", "13:30", "15:58"],
  "1W": ["Mon", "Tue", "Thu", "Fri"],
  "1M": ["Jul 25", "Aug 5", "Aug 15", "Aug 25"],
  YTD: ["Jan 1", "Mar 15", "Jun 15", "Aug 25"],
  "1Y": ["Aug ’24", "Dec ’24", "Apr ’25", "Aug ’25"],
};
export function CompareChart({ rows, benchmarkLabel, range }: { rows: CompareRow[]; benchmarkLabel: string; range: CompareRange }) {
  const benchmarkReturn = compareBenchmark.returnByRange[range];
  const domain = comparisonDomain([...rows.map(r => r.returnPct), benchmarkReturn]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain.min + (domain.max - domain.min) * i / 4)
    .filter(value => value === 0 || Math.abs(comparisonY(value, domain) - comparisonY(0, domain)) >= 16);
  return <figure className="comparison-chart"><svg viewBox="0 0 980 250" preserveAspectRatio="none" role="img" aria-label={`Illustrative ${range} returns for ${rows.map(r => r.series.ticker).join(", ")} and ${benchmarkLabel}`}>
    {ticks.map(value => <g key={value}><line x1="8" x2="910" y1={comparisonY(value, domain)} y2={comparisonY(value, domain)} stroke="var(--color-line-soft)" strokeDasharray="4 6" /><text x="976" y={comparisonY(value, domain) + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">{value}%</text></g>)}
    <line x1="8" x2="910" y1={comparisonY(0, domain)} y2={comparisonY(0, domain)} stroke="var(--color-line)" />
    {!ticks.includes(0) && <text x="976" y={comparisonY(0, domain) + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">0%</text>}
    <polyline points={comparisonPoints(benchmarkReturn, 0, domain)} fill="none" stroke="var(--color-chart-benchmark)" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
    {rows.map((row, index) => <g key={row.series.ticker}><polyline points={comparisonPoints(row.returnPct, index + 1, domain)} fill="none" stroke={row.series.colorVar} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" /><circle cx="910" cy={comparisonY(row.returnPct, domain)} r="3" fill={row.series.colorVar} /></g>)}
    {labels[range].map((label, i) => <text key={label} x={8 + i * 902 / 3} y="246" textAnchor={i === 3 ? "end" : "start"} fill="var(--color-text-muted)" fontSize="10">{label}</text>)}
  </svg></figure>;
}
