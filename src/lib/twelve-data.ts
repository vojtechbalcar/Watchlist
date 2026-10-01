/**
 * The only module that talks to Twelve Data. Callers reserve credits through
 * src/lib/api-budget.ts first; every function here costs 1 credit per symbol
 * (the stock list costs 1 in total).
 */

const BASE_URL = "https://api.twelvedata.com";

/** The exchanges and security types search offers. Twelve Data's US list is mostly OTC. */
const LISTED_EXCHANGES = new Set(["NASDAQ", "NYSE"]);
const LISTED_TYPES = new Set(["Common Stock", "American Depositary Receipt", "Depositary Receipt", "REIT"]);

export type ListedStock = { symbol: string; name: string; exchange: string; type: string; currency: string };
export type LiveQuote = { symbol: string; price: number; changeAbs: number; changePct: number; asOf: Date };
export type Close = { date: string; close: number };

export class TwelveDataError extends Error {
  readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = "TwelveDataError";
    this.code = code;
  }
}

type Json = Record<string, unknown>;

function isError(value: unknown): value is { code: number; message: string } {
  return typeof value === "object" && value !== null && (value as Json).status === "error";
}

function toNumber(value: unknown) {
  const number = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? number : null;
}

/**
 * Batch responses are keyed by symbol; a single-symbol response is the bare
 * object. Symbols Twelve Data rejected come back as per-symbol errors and are
 * left out.
 */
function bySymbol(json: unknown, symbols: string[]): Map<string, Json> {
  const entries = symbols.length === 1 ? [[symbols[0], json] as const] : symbols.map(symbol => [symbol, (json as Json)[symbol]] as const);
  return new Map(entries.filter((entry): entry is readonly [string, Json] => typeof entry[1] === "object" && entry[1] !== null && !isError(entry[1])));
}

export function parseStockList(json: unknown): ListedStock[] {
  const data = (json as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  const seen = new Map<string, ListedStock>();
  for (const row of data as Json[]) {
    const { symbol, name, exchange, type, currency } = row;
    if (typeof symbol !== "string" || typeof name !== "string" || typeof exchange !== "string" || typeof type !== "string") continue;
    if (!LISTED_EXCHANGES.has(exchange) || !LISTED_TYPES.has(type) || seen.has(symbol)) continue;
    seen.set(symbol, { symbol, name, exchange, type, currency: typeof currency === "string" ? currency : "USD" });
  }
  return [...seen.values()];
}

export function parseQuotes(json: unknown, symbols: string[]): LiveQuote[] {
  const quotes: LiveQuote[] = [];
  for (const [symbol, row] of bySymbol(json, symbols)) {
    const price = toNumber(row.close);
    const changeAbs = toNumber(row.change);
    const changePct = toNumber(row.percent_change);
    // The last trade's time when the feed has it, else the bar's.
    const seconds = typeof row.last_quote_at === "number" ? row.last_quote_at : typeof row.timestamp === "number" ? row.timestamp : null;
    if (price === null || changeAbs === null || changePct === null || seconds === null) continue;
    quotes.push({ symbol, price, changeAbs, changePct, asOf: new Date(seconds * 1000) });
  }
  return quotes;
}

export function parseDailyCloses(json: unknown, symbols: string[]): Map<string, Close[]> {
  const result = new Map<string, Close[]>();
  for (const [symbol, row] of bySymbol(json, symbols)) {
    if (!Array.isArray(row.values)) continue;
    const closes = (row.values as Json[])
      .map(value => ({ date: value.datetime, close: toNumber(value.close) }))
      .filter((value): value is Close => typeof value.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.date) && value.close !== null);
    result.set(symbol, closes);
  }
  return result;
}

export function parseLogo(json: unknown): string | null {
  const url = (json as Json | null)?.url;
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

export function isTwelveDataConfigured() {
  return Boolean(process.env.TWELVE_DATA_API_KEY);
}

async function call(path: string, params: Record<string, string>): Promise<unknown> {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) throw new TwelveDataError("TWELVE_DATA_API_KEY is not set", 401);
  const response = await fetch(`${BASE_URL}/${path}?${new URLSearchParams(params)}`, { headers: { Authorization: `apikey ${key}` } });
  const json: unknown = await response.json().catch(() => null);
  if (isError(json)) throw new TwelveDataError(json.message, json.code);
  if (!response.ok || json === null) throw new TwelveDataError(`Twelve Data answered ${response.status}`, response.status);
  return json;
}

/** Every NASDAQ and NYSE listing search offers. 1 credit. */
export async function fetchStockList() {
  return parseStockList(await call("stocks", { country: "United States" }));
}

/** 1 credit per symbol. */
export async function fetchQuotes(symbols: string[]) {
  if (symbols.length === 0) return [];
  return parseQuotes(await call("quote", { symbol: symbols.join(",") }), symbols);
}

/** Newest first, `sessions` per symbol. 1 credit per symbol. */
export async function fetchDailyCloses(symbols: string[], sessions: number) {
  if (symbols.length === 0) return new Map<string, Close[]>();
  return parseDailyCloses(await call("time_series", { symbol: symbols.join(","), interval: "1day", outputsize: String(sessions) }), symbols);
}

/** 1 credit. Null when Twelve Data has no logo for the symbol. */
export async function fetchLogo(symbol: string) {
  try {
    return parseLogo(await call("logo", { symbol }));
  } catch (error) {
    // A missing logo is an answer; a rate limit or outage is not.
    if (error instanceof TwelveDataError && error.code === 404) return null;
    throw error;
  }
}
