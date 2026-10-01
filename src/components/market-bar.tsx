"use client";

import { formatPct, formatPrice, directionOf } from "@/lib/format";
import { useMarket } from "./market-provider";

/** The broad market at a glance, through the ETFs that track each index. */
export function MarketBar() {
  const { indices } = useMarket();
  return (
    <div className="market-summary-bar h-marketbar border-b border-line bg-surface-sunken">
      <div className="mx-auto flex h-full max-w-(--container-page) items-center px-8">
        <span className="shrink-0 pr-8 text-base tracking-ticker text-text-faint">
          MARKETS
        </span>

        <dl className="flex h-[28px] min-w-0 flex-1 items-center justify-between overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {indices.map((index) => {
            const direction = index.changePct === null ? null : directionOf(index.changePct);
            return (
              <div
                key={index.label}
                className="flex shrink-0 items-baseline gap-3 border-l border-line px-6 whitespace-nowrap"
              >
                <dt className="font-data text-base font-semibold tracking-ticker text-text-ticker">
                  {index.label}
                </dt>
                <dd className="font-data text-base tracking-ticker text-text-numeric" title={`Through the ${index.ticker} ETF`}>
                  {index.price === null ? "—" : `${index.ticker} ${formatPrice(index.price)}`}
                </dd>
                <dd
                  className={[
                    "font-data text-base font-semibold tracking-ticker",
                    direction === null ? "text-text-muted" : direction === "up" ? "text-up" : "text-down",
                  ].join(" ")}
                >
                  {index.changePct === null ? "—" : formatPct(index.changePct)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
