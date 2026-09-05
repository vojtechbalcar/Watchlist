import { compareBenchmark, compareMonths, type CompareRow } from "@/lib/compare-data";

/**
 * Every selected stock against the benchmark over the range.
 *
 * The series are the exact vectors from Figma, all held in one viewBox so the
 * lines stay registered to each other and to the grid at any width. They are
 * placeholder geometry — see compare-data.ts.
 */
export function CompareChart({
  rows,
  benchmarkLabel,
  range,
}: {
  rows: CompareRow[];
  benchmarkLabel: string;
  range: string;
}) {
  const names = rows.map((row) => row.series.ticker).join(", ");

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 1538 375"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${names} compared with the ${benchmarkLabel} over ${range}`}
        className="block h-[371px] w-full"
      >
        {[61.92, 189.92, 318.92].map((y) => (
          <path
            key={y}
            d={`M0 ${y}H1509`}
            stroke="var(--color-chart-grid)"
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path
          d={compareBenchmark.path}
          fill="none"
          stroke="var(--color-series-benchmark)"
          strokeWidth={4}
          strokeDasharray="12 12"
          vectorEffect="non-scaling-stroke"
        />

        {rows.map((row) => (
          <path
            key={row.series.ticker}
            d={row.series.path}
            fill="none"
            stroke={row.series.colorVar}
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <figcaption className="mt-4 flex justify-between font-data text-base font-medium text-text-faint">
        {compareMonths.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </figcaption>
    </figure>
  );
}
