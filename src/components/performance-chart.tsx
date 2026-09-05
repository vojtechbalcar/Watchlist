import { chartMonths } from "@/lib/watchlist-data";

/**
 * Watchlist vs benchmark over the selected range.
 *
 * The three series paths are the exact vectors exported from Figma, held in a
 * single viewBox so the fill, both lines and their end dots stay registered to
 * each other at any width. They are placeholder geometry: once ranged price
 * history lands in Postgres these `d` attributes get generated from it.
 */
export function PerformanceChart() {
  return (
    <figure className="m-0">
      <div className="relative w-full">
        {/* horizontal rules sit behind the series */}
        <div aria-hidden className="absolute inset-0">
          {["21.3%", "54.7%", "90.6%"].map((top) => (
            <span
              key={top}
              className="absolute inset-x-0 block border-t border-line-soft"
              style={{ top }}
            />
          ))}
        </div>

        <svg
          viewBox="0 0 1528 310"
          preserveAspectRatio="none"
          role="img"
          aria-label="Watchlist performance compared with the S&P 500 over the year to date"
          className="relative block h-[307px] w-full"
        >
          {/* the lead: area between watchlist and benchmark */}
          <path
            d="M191.5 251L0 307L190.5 232.5L385.5 213.5L515 191L776 144.5L962.5 120.5L1299.5 44.5L1527 0V30L1398 61L1254 102.5L1221.5 108.5L948 154L680 195L480 224.5L388 234L330.5 239L191.5 251Z"
            fill="var(--color-chart-lead)"
          />
          {/* benchmark */}
          <path
            d="M0.416101 308.459L71.4161 287.959L191.416 252.459L401.416 234.459L492.416 224.459L689.416 194.959L977.916 150.959L1013.92 145.959L1168.42 119.959L1253.92 103.959L1410.42 58.959L1527.92 30.959"
            fill="none"
            stroke="var(--color-chart-benchmark)"
            strokeWidth="3"
            strokeDasharray="12 8"
            vectorEffect="non-scaling-stroke"
          />
          {/* watchlist */}
          <path
            d="M0.543138 308.472L191.043 234.472L386.543 215.472L776.543 145.972L957.543 122.972L1300.04 45.4725L1526.54 1.47247"
            fill="none"
            stroke="var(--color-chart-watchlist)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="1526.5" cy="1.5" r="3.5" fill="var(--color-chart-watchlist)" />
          <circle cx="1524" cy="31" r="3.5" fill="var(--color-chart-benchmark)" />
        </svg>
      </div>

      <figcaption className="mt-4 flex justify-between font-data text-base font-medium text-text-faint">
        {chartMonths.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </figcaption>
    </figure>
  );
}

export function ChartLegend({ benchmarkLabel }: { benchmarkLabel: string }) {
  return (
    <ul className="flex items-center gap-10 text-md font-medium text-text-label">
      <li className="flex items-center gap-3">
        <span aria-hidden className="h-[4px] w-[23px] bg-chart-watchlist" />
        Your watchlist
      </li>
      <li className="flex items-center gap-3">
        <span aria-hidden className="flex w-[23px] justify-between">
          <i className="h-[3px] w-[6px] bg-chart-benchmark" />
          <i className="h-[3px] w-[6px] bg-chart-benchmark" />
          <i className="h-[3px] w-[6px] bg-chart-benchmark" />
        </span>
        {benchmarkLabel}
      </li>
      <li className="flex items-center gap-3">
        <span
          aria-hidden
          className="size-[17px] w-[21px] rounded-chip border border-up bg-up-surface"
        />
        Your lead
      </li>
    </ul>
  );
}
