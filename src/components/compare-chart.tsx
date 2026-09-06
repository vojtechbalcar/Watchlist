import { compareBenchmark, type CompareRow, type CompareRange } from "@/lib/compare-data";

// Illustrative demo history, normalized to each range's documented return.
// Replace the shape with dated price history when the data layer is connected.
const shape = [0, .12, .2, .17, .3, .35, .28, .44, .52, .5, .66, .74, .7, .86, 1];
const labels: Record<CompareRange, string[]> = {
  "1D": ["09:30", "11:30", "13:30", "15:58"],
  "1W": ["Mon", "Tue", "Thu", "Fri"],
  "1M": ["Jul 25", "Aug 5", "Aug 15", "Aug 25"],
  YTD: ["Jan 1", "Mar 15", "Jun 15", "Aug 25"],
  "1Y": ["Aug ’24", "Dec ’24", "Apr ’25", "Aug ’25"],
};
export function CompareChart({ rows, benchmarkLabel, range }: { rows: CompareRow[]; benchmarkLabel: string; range: CompareRange }) {
  const benchmarkReturn = compareBenchmark.returnByRange[range];
  const top = Math.ceil(Math.max(...rows.map(r => r.returnPct), benchmarkReturn) / 4) * 4 || 4;
  function points(total: number, index: number) {
    return shape.map((v, i) => {
      const progress = i / (shape.length - 1);
      const wobble = Math.sin(i * (1.3 + index * .3)) * .045 * Math.sin(progress * Math.PI);
      return `${8 + progress * 902},${210 - (v + wobble) * total / top * 190}`;
    }).join(" ");
  }
  return <figure className="comparison-chart"><svg viewBox="0 0 980 250" preserveAspectRatio="none" role="img" aria-label={`Illustrative ${range} returns for ${rows.map(r => r.series.ticker).join(", ")} and ${benchmarkLabel}`}>
    {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="8" x2="910" y1={210 - i * 47.5} y2={210 - i * 47.5} stroke="var(--color-line-soft)" strokeDasharray="4 6" /><text x="976" y={214 - i * 47.5} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">{top / 4 * i}%</text></g>)}
    <polyline points={points(benchmarkReturn, 0)} fill="none" stroke="var(--color-chart-benchmark)" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
    {rows.map((row, index) => <g key={row.series.ticker}><polyline points={points(row.returnPct, index + 1)} fill="none" stroke={row.series.colorVar} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" /><circle cx="910" cy={210 - row.returnPct / top * 190} r="3" fill={row.series.colorVar} /></g>)}
    {labels[range].map((label, i) => <text key={label} x={8 + i * 902 / 3} y="246" textAnchor={i === 3 ? "end" : "start"} fill="var(--color-text-muted)" fontSize="10">{label}</text>)}
  </svg></figure>;
}
