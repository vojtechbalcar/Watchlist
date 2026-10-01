"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { MarketSeries, MarketSnapshot } from "@/lib/market";
import { marketView, type MarketView } from "@/lib/market-view";

const MarketContext = createContext<MarketView | null>(null);

/** The market snapshot the (market) layout reads, shared with every signed-in page. */
export function MarketProvider({ snapshot, children }: { snapshot: MarketSnapshot; children: React.ReactNode }) {
  const view = useMemo(() => marketView(snapshot), [snapshot]);
  return <MarketContext.Provider value={view}>{children}</MarketContext.Provider>;
}

export function useMarket(): MarketView {
  const market = useContext(MarketContext);
  if (!market) throw new Error("useMarket needs a MarketProvider; it is set up in the (market) layout.");
  return market;
}

/** Return lines are only needed by charts, so they load separately and once per page session. */
let series: Promise<MarketSeries> | null = null;

function loadSeries() {
  series ??= fetch("/api/market/series")
    .then(response => (response.ok ? (response.json() as Promise<MarketSeries>) : Promise.reject(new Error(`Series answered ${response.status}`))))
    .catch(error => {
      series = null;
      throw error;
    });
  return series;
}

/** Null while loading or if the lines couldn't load; charts show their empty state then. */
export function useMarketSeries() {
  const [state, setState] = useState<MarketSeries | null>(null);
  useEffect(() => {
    let current = true;
    loadSeries().then(value => current && setState(value), () => {});
    return () => {
      current = false;
    };
  }, []);
  return state;
}

const asOfFormat = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** "Oct 1 · 15:58 ET", or null before the first quote. */
export function formatAsOf(iso: string | null) {
  if (!iso) return null;
  const parts = Object.fromEntries(asOfFormat.formatToParts(new Date(iso)).map(part => [part.type, part.value]));
  return `${parts.month} ${parts.day} · ${parts.hour}:${parts.minute} ET`;
}
