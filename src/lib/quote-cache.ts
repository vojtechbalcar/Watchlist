import { QUOTE_LIMIT, SEARCH_LIMIT, type StockQuote } from "./search-ranking";

const LIVE_FRESH_MS = 60_000;
const STORED_FRESH_MS = 5 * 60_000;
const RETRY_MS = 5000;

type CachedQuote = { quote: StockQuote | null; at: number; live: boolean; request: number };

/** One owner for quote freshness, pending requests, response ordering, and notifications. */
export function createQuoteCache({ fetchQuotes, now = Date.now }: {
  fetchQuotes: (symbols: string[], live: boolean) => Promise<Record<string, StockQuote>>;
  now?: () => number;
}) {
  const cache = new Map<string, CachedQuote>();
  const failures = new Map<string, number>();
  const liveRequests = new Map<string, Promise<void>>();
  const storedRequests = new Map<string, Promise<void>>();
  const listeners = new Set<() => void>();
  let sequence = 0;
  let version = 0;

  function notify() {
    version++;
    listeners.forEach(listener => listener());
  }

  function fresh(symbol: string, live: boolean) {
    const value = cache.get(symbol);
    return value !== undefined && (!live || value.live) && now() - value.at < (live ? LIVE_FRESH_MS : STORED_FRESH_MS);
  }

  function request(symbols: string[], live: boolean) {
    const id = ++sequence;
    const pending = live ? liveRequests : storedRequests;
    const task = Promise.resolve()
      .then(() => fetchQuotes(symbols, live))
      .then(quotes => {
        const at = now();
        for (const symbol of symbols) {
          // Request order, not completion order, decides which answer is current.
          if ((cache.get(symbol)?.request ?? 0) > id) continue;
          cache.set(symbol, { quote: quotes[symbol] ?? null, at, live, request: id });
          failures.delete(symbol);
        }
      }, () => {
        for (const symbol of symbols) {
          if ((cache.get(symbol)?.request ?? 0) <= id) failures.set(symbol, now() + RETRY_MS);
        }
      })
      .finally(() => {
        symbols.forEach(symbol => pending.delete(symbol));
        notify();
      });
    symbols.forEach(symbol => pending.set(symbol, task));
    return task;
  }

  return {
    quoteOf(symbol: string): StockQuote | null | undefined {
      const value = cache.get(symbol);
      return value ? value.quote : failures.has(symbol) ? null : undefined;
    },
    getVersion: () => version,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    async load(symbols: string[], live: boolean) {
      // Cap the visible live selection before removing cached or pending symbols.
      const wanted = [...new Set(symbols)].slice(0, live ? SEARCH_LIMIT : symbols.length);
      const waiting = new Set<Promise<void>>();
      const missing: string[] = [];
      for (const symbol of wanted) {
        const pending = liveRequests.get(symbol) ?? (!live ? storedRequests.get(symbol) : undefined);
        if (pending) waiting.add(pending);
        else if (!fresh(symbol, live) && now() >= (failures.get(symbol) ?? 0)) missing.push(symbol);
      }
      const limit = live ? SEARCH_LIMIT : QUOTE_LIMIT;
      for (let i = 0; i < missing.length; i += limit) waiting.add(request(missing.slice(i, i + limit), live));
      await Promise.all(waiting);
    },
  };
}
