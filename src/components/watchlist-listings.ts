"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { WatchlistListing } from "@/lib/listing-detail";
import type { SeriesPoint } from "@/lib/market";
import type { Period } from "@/lib/period-returns";
import type { WatchlistStock } from "@/lib/watchlist-catalog";
import { useMarket } from "./market-provider";

/** The server keeps prices for 15 minutes; a minute here spares repeat requests between pages. */
const FRESH_MS = 60 * 1000;

/** Per symbol: the listing, or null when it isn't one. Shared by every component on the page. */
const cache = new Map<string, { at: number; stock: WatchlistListing | null }>();
const loading = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function notify() {
  version++;
  listeners.forEach(listener => listener());
}

function load(symbols: string[]) {
  const now = Date.now();
  const due = symbols.filter(symbol => !loading.has(symbol) && now - (cache.get(symbol)?.at ?? 0) >= FRESH_MS);
  if (!due.length) return;
  due.forEach(symbol => loading.add(symbol));
  fetch(`/api/stocks/watchlist?symbols=${encodeURIComponent(due.join(","))}`)
    .then(response => (response.ok ? (response.json() as Promise<{ stocks: WatchlistListing[] }>) : Promise.reject(new Error(`Watchlist stocks answered ${response.status}`))))
    .then(({ stocks }) => {
      const at = Date.now();
      due.forEach(symbol => cache.set(symbol, { at, stock: stocks.find(stock => stock.ticker === symbol) ?? null }));
    }, () => { /* Rows keep their gaps; the next render asks again. */ })
    .finally(() => {
      due.forEach(symbol => loading.delete(symbol));
      notify();
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const noReturns: WatchlistStock["returns"] = { "1D": null, "1W": null, "1M": null, YTD: null, "1Y": null };

/** A row to hold the stock's place until its figures arrive, or when there are none. */
function gapStock(ticker: string, listing: WatchlistListing | null | undefined): WatchlistStock {
  if (!listing) return { ticker, name: ticker, price: null, currency: "USD", changeAbs: null, changePct: null, logoSrc: null, returns: noReturns, untracked: true };
  return {
    ticker, name: listing.name, price: listing.price, currency: listing.currency,
    changeAbs: listing.changeAbs, changePct: listing.changePct, logoSrc: null, remoteLogo: listing.logoUrl,
    returns: listing.returns, untracked: true,
  };
}

/**
 * Every saved stock with its figures: tracked ones from the market snapshot,
 * the rest fetched when viewed (see /api/stocks/watchlist), plus their chart
 * lines. A stock still loading, or no longer listed, keeps a row of gaps.
 */
export function useWatchlistStocks(tickers: string[]) {
  const market = useMarket();
  useSyncExternalStore(subscribe, () => version, () => 0);
  const others = tickers.filter(ticker => !market.stock(ticker));
  const key = others.join(",");
  useEffect(() => {
    if (key) load(key.split(","));
  }, [key]);

  const series: Record<string, Partial<Record<Period, SeriesPoint[]>>> = {};
  for (const ticker of others) {
    const listing = cache.get(ticker)?.stock;
    if (listing) series[ticker] = listing.series;
  }
  return {
    stocks: [...market.stocks, ...others.map(ticker => gapStock(ticker, cache.get(ticker)?.stock))] as WatchlistStock[],
    /** Lines for the untracked stocks; tracked lines come from useMarketSeries. */
    series,
  };
}
