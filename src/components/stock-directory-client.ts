"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { decodeDirectory, type DirectoryPayload, type DirectoryStock, type StockQuote } from "@/lib/search-ranking";
import { createQuoteCache } from "@/lib/quote-cache";

/** Loaded once per page session and shared by search and the sector lists. */
let directory: Promise<DirectoryStock[]> | null = null;

function loadDirectory() {
  directory ??= fetch("/api/stocks")
    .then(response => (response.ok ? (response.json() as Promise<DirectoryPayload>) : Promise.reject(new Error(`Stock list answered ${response.status}`))))
    .then(decodeDirectory)
    .catch(error => {
      // Let the next mount try again.
      directory = null;
      throw error;
    });
  return directory;
}

export function useStockDirectory() {
  const [state, setState] = useState<{ stocks: DirectoryStock[] | null; failed: boolean }>({ stocks: null, failed: false });
  useEffect(() => {
    let current = true;
    loadDirectory().then(
      stocks => current && setState({ stocks, failed: false }),
      () => current && setState({ stocks: null, failed: true }),
    );
    return () => {
      current = false;
    };
  }, []);
  return state;
}

const quotes = createQuoteCache({
  async fetchQuotes(symbols, live) {
    const response = await fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(symbols.join(","))}${live ? "&live=1" : ""}`);
    if (!response.ok) throw new Error(`Quotes answered ${response.status}`);
    return ((await response.json()) as { quotes: Record<string, StockQuote> }).quotes;
  },
});

/**
 * Prices for `symbols`: undefined while loading, null when there is none.
 * `live` lets the server fetch untracked stocks from Twelve Data (search);
 * otherwise only stored prices are read (sector lists). `delay` skips
 * requests for symbols the user has already typed past.
 */
export function useStockQuotes(symbols: string[], live: boolean, delay = 0) {
  const key = symbols.join(",");
  useSyncExternalStore(quotes.subscribe, quotes.getVersion, () => 0);

  useEffect(() => {
    if (!key) return;
    const timer = setTimeout(() => void quotes.load(key.split(","), live), delay);
    // Once started, a shared request belongs to the cache rather than this caller.
    return () => clearTimeout(timer);
  }, [key, live, delay]);

  return quotes.quoteOf;
}
