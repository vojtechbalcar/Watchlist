"use client";

import { formatAsOf, useMarket } from "./market-provider";

/** When the shown prices are from: the newest quote the price job stored. */
export function MarketAsOf({ className }: { className?: string }) {
  const iso = useMarket().asOf;
  const asOf = formatAsOf(iso);
  return <span className={className}>{iso && asOf ? <>Prices as of <time dateTime={iso}>{asOf}</time></> : "No prices yet"}</span>;
}
