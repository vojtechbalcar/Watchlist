"use client";

import { useEffect, useState } from "react";
import { decodeDirectory, type DirectoryPayload, type DirectoryStock, type StockQuote } from "@/lib/search-ranking";

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

/** Live answers are reused for a minute; stored-only ones, which change slower, for five. */
const LIVE_FRESH_MS = 60 * 1000;
const STORED_FRESH_MS = 5 * 60 * 1000;
const quoteCache = new Map<string, { quote: StockQuote | null; at: number; live: boolean }>();

function isFresh(symbol: string, live: boolean, now: number) {
  const cached = quoteCache.get(symbol);
  if (!cached || (live && !cached.live)) return false;
  return now - cached.at < (live ? LIVE_FRESH_MS : STORED_FRESH_MS);
}

/**
 * Prices for `symbols`: undefined while loading, null when there is none.
 * `live` lets the server fetch untracked stocks from Twelve Data (search);
 * otherwise only stored prices are read (sector lists). `delay` skips
 * requests for symbols the user has already typed past.
 */
export function useStockQuotes(symbols: string[], live: boolean, delay = 0) {
  const key = symbols.join(",");
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!key) return;
    const missing = key.split(",").filter(symbol => !isFresh(symbol, live, Date.now()));
    if (missing.length === 0) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(missing.join(","))}${live ? "&live=1" : ""}`, { signal: controller.signal })
        .then(response => (response.ok ? (response.json() as Promise<{ quotes: Record<string, StockQuote> }>) : Promise.reject(new Error(`Quotes answered ${response.status}`))))
        .then(({ quotes }) => {
          const at = Date.now();
          for (const symbol of missing) quoteCache.set(symbol, { quote: quotes[symbol] ?? null, at, live });
          setVersion(version => version + 1);
        })
        .catch(() => {
          // Aborted or failed: rows keep showing their loading state until the next change.
        });
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, live, delay]);

  return (symbol: string) => quoteCache.get(symbol)?.quote;
}
