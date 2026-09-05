import Image from "next/image";
import { formatPct, directionOf } from "@/lib/format";
import type { CompareRow } from "@/lib/compare-data";
import type { Holding } from "@/lib/watchlist-data";

function LogoTile({ holding }: { holding: Holding }) {
  return (
    <span className="grid size-[51px] shrink-0 place-items-center overflow-clip rounded-logo bg-black">
      {holding.logoSrc ? (
        <Image
          src={holding.logoSrc}
          alt=""
          width={40}
          height={28}
          className="h-[28px] w-[40px] object-contain"
        />
      ) : (
        <span className="font-data text-base font-semibold text-surface-raised">
          {holding.ticker.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

function Gap({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="inline-flex h-[30px] items-center justify-end">
        <span className="sr-only">Not applicable</span>
        <span
          aria-hidden
          className="block h-[4px] w-[22px] rounded-full bg-value-empty"
        />
      </span>
    );
  }

  return (
    <span
      className={[
        "font-data text-ticker font-bold tracking-tight",
        directionOf(value) === "up" ? "text-up" : "text-down",
      ].join(" ")}
    >
      {formatPct(value)}
    </span>
  );
}

const NUMERIC = "w-[190px] pr-6 text-right";

export function FullComparisonTable({
  rows,
  benchmarkLabel,
}: {
  rows: CompareRow[];
  benchmarkLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-card-lg border border-line bg-surface-raised shadow-card">
      {/* Fixed columns need room to stay fixed: one stock column plus RETURN,
          the benchmark, and one peer column per stock. */}
      <table
        className="w-full table-fixed border-collapse"
        style={{ minWidth: 340 + 190 * (2 + rows.length) }}
      >
        <thead>
          <tr className="h-[60px] border-b border-line">
            <th
              scope="col"
              className="pl-6 text-left text-base font-medium text-text-muted sm:pl-10 xl:pl-[42px]"
            >
              STOCK
            </th>
            <th scope="col" className={`${NUMERIC} text-base font-medium text-text-muted`}>
              RETURN
            </th>
            {/* Maroon marks the benchmark column: brand, not direction. */}
            <th scope="col" className={`${NUMERIC} text-base font-medium text-brand`}>
              VS {benchmarkLabel}
            </th>
            {rows.map((row) => (
              <th
                key={row.series.ticker}
                scope="col"
                className={`${NUMERIC} text-base font-medium text-text-ticker`}
              >
                VS {row.series.ticker}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.series.ticker}
              className="h-[106px] border-b border-line-soft last:border-b-0"
            >
              <th
                scope="row"
                className="pl-6 text-left font-normal sm:pl-10 xl:pl-[42px]"
              >
                <span className="flex items-center gap-8">
                  <span
                    aria-hidden
                    className="block size-[14px] shrink-0 rounded-full"
                    style={{ backgroundColor: row.series.colorVar }}
                  />
                  <LogoTile holding={row.holding} />
                  <span className="min-w-0">
                    <span className="block font-data text-ticker font-semibold tracking-tight text-ink">
                      {row.holding.ticker}
                    </span>
                    <span className="block truncate font-data text-sm font-light tracking-tight text-text-secondary">
                      {row.holding.name}
                    </span>
                  </span>
                </span>
              </th>

              <td
                className={`${NUMERIC} font-data text-ticker font-semibold tracking-tight text-ink`}
              >
                {formatPct(row.returnPct)}
              </td>

              <td className={NUMERIC}>
                <Gap value={row.vsBenchmarkPct} />
              </td>

              {rows.map((peer) => (
                <td key={peer.series.ticker} className={NUMERIC}>
                  <Gap value={row.vsPeers[peer.series.ticker]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
