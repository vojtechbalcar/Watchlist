"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { DirectionCaret } from "./direction-caret";
import { TrendLine } from "./trend-line";
import { formatPrice, formatPct, formatPctBare, directionOf } from "@/lib/format";
import type { Holding, WatchlistSummary } from "@/lib/watchlist-data";

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

/** The dash that becomes a filled control when its row is hovered or focused. */
function RemoveButton({ ticker, onRemove }: { ticker: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${ticker} from watchlist`}
      className="grid size-[31px] place-items-center rounded-logo bg-transparent text-remove-idle transition-colors group-hover:bg-remove-surface group-hover:text-remove-mark focus-visible:bg-remove-surface focus-visible:text-remove-mark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-remove-mark"
    >
      <svg viewBox="0 0 13 2" aria-hidden className="block w-[13px]">
        <path d="M0 1H13" stroke="currentColor" strokeWidth={2} />
      </svg>
    </button>
  );
}

const CELL = {
  price: "w-[110px] text-right",
  today: "w-[130px] text-right",
  vs: "w-[130px] text-right",
  trend: "hidden w-[373px] pr-[50px] pl-[110px] lg:table-cell",
  action: "w-[120px] pl-[44px]",
};

function Row({ holding, onRemove }: { holding: Holding; onRemove: () => void }) {
  const dayDirection = directionOf(holding.changePct);
  const vsDirection = directionOf(holding.vsBenchmarkPct);

  return (
    <tr className="group h-[91px] border-b border-line-soft transition-colors last:border-b-0 hover:bg-surface-row-hover">
      <th scope="row" className="py-0 pl-6 text-left font-normal sm:pl-10 xl:pl-[68px]">
        <span className="flex items-center gap-6">
          <LogoTile holding={holding} />
          <span className="min-w-0">
            <span className="block font-data text-ticker font-semibold tracking-tight text-ink">
              {holding.ticker}
            </span>
            <span className="block truncate font-data text-sm font-light tracking-tight text-text-secondary">
              {holding.name}
            </span>
          </span>
        </span>
      </th>

      <td className={`${CELL.price} font-data text-xl font-semibold tracking-tight text-ink-strong`}>
        {formatPrice(holding.price)}
      </td>

      <td className={CELL.today}>
        <span className="flex items-center justify-end gap-3">
          <DirectionCaret direction={dayDirection} />
          <span className="font-data text-xl font-semibold tracking-tight text-text-muted">
            {formatPctBare(holding.changePct)}
          </span>
        </span>
      </td>

      <td
        className={[
          CELL.vs,
          "font-data text-2xl font-bold tracking-tight",
          vsDirection === "up" ? "text-up" : "text-down",
        ].join(" ")}
      >
        {formatPct(holding.vsBenchmarkPct)}
      </td>

      {/* The 30-day shape tracks the holding against the benchmark, so it
          follows vs-market rather than the intraday move. */}
      <td className={CELL.trend}>
        <TrendLine direction={vsDirection} />
      </td>

      <td className={`${CELL.action} pr-6 sm:pr-10 xl:pr-[43px]`}>
        <RemoveButton ticker={holding.ticker} onRemove={onRemove} />
      </td>
    </tr>
  );
}

export function WatchlistTable({
  holdings,
  summary,
  benchmarkLabel,
}: {
  holdings: Holding[];
  summary: WatchlistSummary;
  benchmarkLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [removed, setRemoved] = useState<string[]>([]);

  /** Sorted by vs-market, strongest lead first — the point of the page. */
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return holdings
      .filter((h) => !removed.includes(h.ticker))
      .filter(
        (h) =>
          needle === "" ||
          h.ticker.toLowerCase().includes(needle) ||
          h.name.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.vsBenchmarkPct - a.vsBenchmarkPct);
  }, [holdings, query, removed]);

  const live = holdings.filter((h) => !removed.includes(h.ticker));
  const beating = live.filter((h) => h.vsBenchmarkPct > 0).length;
  const basketDirection = directionOf(summary.basketWeightedReturnPct);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-title font-bold text-ink">Watchlist</h1>
          <p className="mt-2 text-xl text-text-muted">
            {live.length} holdings · {beating} beating the market · sorted by vs-market
          </p>
        </div>

        <div className="flex items-center gap-6">
          <label className="relative block w-[335px] max-w-full">
            <span className="sr-only">Search stock</span>
            <svg
              viewBox="0 0 20 20"
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-6 size-[20px] -translate-y-1/2 text-text-faint"
            >
              <path
                d="M19.7192 18.3139L16.0114 14.6333C17.4506 12.8374 18.1476 10.5579 17.959 8.26356C17.7705 5.96919 16.7106 3.83432 14.9975 2.29792C13.2844 0.761532 11.0481 -0.0595993 8.74862 0.00337152C6.4491 0.0663423 4.26109 1.00863 2.63448 2.63648C1.00786 4.26433 0.066292 6.454 0.00336896 8.75527C-0.059554 11.0565 0.760954 13.2945 2.29618 15.0089C3.83141 16.7233 5.96466 17.784 8.25729 17.9727C10.5499 18.1614 12.8277 17.4639 14.6222 16.0235L18.3 19.7042C18.3929 19.7979 18.5035 19.8723 18.6253 19.9231C18.747 19.9739 18.8777 20 19.0096 20C19.1415 20 19.2722 19.9739 19.3939 19.9231C19.5157 19.8723 19.6263 19.7979 19.7192 19.7042C19.8993 19.5177 20 19.2684 20 19.009C20 18.7497 19.8993 18.5004 19.7192 18.3139ZM9.01554 16.0235C7.63189 16.0235 6.27932 15.6129 5.12886 14.8436C3.9784 14.0743 3.08172 12.9809 2.55223 11.7016C2.02273 10.4223 1.88419 9.01462 2.15412 7.65653C2.42406 6.29844 3.09035 5.05095 4.06873 4.07183C5.04712 3.0927 6.29366 2.4259 7.65072 2.15576C9.00778 1.88562 10.4144 2.02426 11.6927 2.55417C12.9711 3.08407 14.0637 3.98142 14.8324 5.13276C15.6011 6.28409 16.0114 7.63769 16.0114 9.02239C16.0114 10.8792 15.2743 12.66 13.9623 13.973C12.6504 15.2859 10.871 16.0235 9.01554 16.0235Z"
                fill="currentColor"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stock..."
              className="h-[50px] w-full rounded-full border border-line-avatar bg-surface-raised pr-6 pl-[58px] font-data text-sm font-light text-ink placeholder:text-text-faint focus-visible:border-brand focus-visible:outline-none"
            />
          </label>

          <button
            type="button"
            className="shrink-0 rounded-[50px] border-4 border-brand-tint bg-brand px-[18px] py-[10px] font-data text-base font-semibold text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* The row grid has a hard minimum; below it the table scrolls inside the
          card rather than pushing the page sideways. */}
      <div className="mt-8 overflow-x-auto rounded-card border border-line bg-surface-raised shadow-card">
        <table className="w-full min-w-[620px] table-fixed border-collapse">
          <caption className="sr-only">
            Holdings ranked by performance against {benchmarkLabel}
          </caption>
          <thead>
            <tr className="h-[86px] border-b border-line">
              <th
                scope="col"
                className="pl-6 text-left text-base font-normal text-text-muted sm:pl-10 xl:pl-[68px]"
              >
                STOCK
              </th>
              <th scope="col" className={`${CELL.price} text-base font-normal text-text-muted`}>
                PRICE
              </th>
              <th scope="col" className={`${CELL.today} text-base font-normal text-text-muted`}>
                TODAY
              </th>
              <th scope="col" className={`${CELL.vs} text-base font-normal text-text-muted`}>
                VS MARKET
              </th>
              <th scope="col" className={`${CELL.trend} text-center text-base font-normal text-text-muted`}>
                30 DAY
              </th>
              <th scope="col" className={`${CELL.action} pr-6 sm:pr-10 xl:pr-[43px]`}>
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((holding) => (
              <Row
                key={holding.ticker}
                holding={holding}
                onRemove={() => setRemoved((prev) => [...prev, holding.ticker])}
              />
            ))}
            {rows.length === 0 && (
              <tr className="h-[91px]">
                <td colSpan={6} className="px-6 text-center text-xl text-text-faint sm:px-10">
                  {live.length === 0
                    ? "Nothing on the watchlist yet."
                    : `No holding matches “${query.trim()}”.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-soft px-6 py-4 sm:px-10 xl:px-[68px]">
          <p className="flex items-center gap-3 font-data text-sm font-light tracking-tight text-text-secondary">
            Basket weighted return
            <span
              className={[
                "flex items-center gap-2 font-medium",
                basketDirection === "up" ? "text-up" : "text-down",
              ].join(" ")}
            >
              <DirectionCaret
                direction={basketDirection}
                tone="direction"
                className="h-[11px] w-[13px]"
              />
              {formatPctBare(summary.basketWeightedReturnPct)}
            </span>
          </p>

          <p className="font-data text-sm font-light tracking-tight text-text-secondary">
            Median gap{" "}
            <span className="font-semibold text-up-deep">
              {formatPct(summary.medianGapPct)}
            </span>{" "}
            vs {benchmarkLabel}
          </p>
        </div>
      </div>
    </>
  );
}
