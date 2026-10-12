"use client";

import { formatPct, formatPrice, directionOf } from "@/lib/format";
import { useMarket } from "./market-provider";

/** The broad market at a glance, through the ETFs that track each index. */
export function MarketBar() {
  const { indices } = useMarket();
  return (
    <div className="market-summary-bar">
      <div className="market-summary-inner">
        <span className="market-summary-label">
          Markets
        </span>

        <dl className="market-summary-grid" aria-label="Market indices">
          {indices.map((index) => {
            const direction = index.changePct === null ? null : directionOf(index.changePct);
            return (
              <div
                key={index.label}
                className="market-summary-item"
              >
                <dt>
                  {index.label}
                </dt>
                <dd className="market-summary-price" title={`Through the ${index.ticker} ETF`}>
                  {index.price === null ? "—" : `${index.ticker} ${formatPrice(index.price)}`}
                </dd>
                <dd
                  className={[
                    "market-summary-change",
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
