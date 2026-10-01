/**
 * Sectors for stocks outside the tracked set, from the SEC's industry codes
 * (SIC). Twelve Data's free plan has no sector data; EDGAR is free and covers
 * about 90% of NASDAQ/NYSE listings. The app has no Materials or Communication
 * sector, so mining and chemicals count as Industrials and telecom as
 * Technology. It's a rough fit, but these stocks would otherwise be in no
 * sector at all.
 */

const USER_AGENT = "Watchlist sector sync admin@usewatchlist.dev";

type SectorName = "Technology" | "Semiconductors" | "Healthcare" | "Financials" | "Consumer" | "Energy" | "Industrials" | "Utilities" | "Real Estate";

/** First match wins, so narrower ranges come before the broad ones they sit inside. */
const sicRanges: [SectorName | null, [number, number][]][] = [
  // Blank-check companies (SPACs) and non-operating shells belong to no sector.
  [null, [[6770, 6770], [9995, 9999]]],
  ["Real Estate", [[6500, 6553], [6798, 6798]]],
  ["Healthcare", [[2833, 2836], [3841, 3851], [5047, 5047], [5122, 5122], [6324, 6324], [8000, 8099], [8731, 8731]]],
  ["Financials", [[6000, 6499], [6700, 6799]]],
  ["Semiconductors", [[3672, 3672], [3674, 3674]]],
  ["Technology", [[3570, 3579], [3660, 3679], [4800, 4899], [7370, 7379]]],
  ["Energy", [[1200, 1399], [2900, 2999], [3533, 3533], [4610, 4619], [4922, 4923], [5171, 5172]]],
  ["Utilities", [[4900, 4999]]],
  ["Consumer", [[2000, 2399], [2500, 2599], [2840, 2844], [3020, 3021], [3140, 3149], [3630, 3639], [3651, 3652], [3710, 3716], [3751, 3751], [3910, 3961], [4700, 4799], [5140, 5149], [5180, 5182], [5200, 5999], [7000, 7099], [7200, 7299], [7500, 7599], [7800, 7999], [8200, 8299]]],
  ["Industrials", [[1000, 1199], [1400, 1799], [2400, 2999], [3000, 3999], [4000, 4699], [5000, 5199], [7300, 7399], [8700, 8799]]],
];

export function sectorForSic(sic: number | null): SectorName | null {
  if (sic === null || !Number.isInteger(sic)) return null;
  for (const [sector, ranges] of sicRanges) {
    if (ranges.some(([from, to]) => sic >= from && sic <= to)) return sector;
  }
  return null;
}

/** Twelve Data writes class shares with a dot (BRK.B); the SEC with a dash (BRK-B). */
export function secTicker(symbol: string) {
  return symbol.replaceAll(".", "-");
}

/** ticker → CIK from the SEC's company_tickers_exchange.json. */
export function parseTickerMap(json: unknown): Map<string, number> {
  const { fields, data } = (json ?? {}) as { fields?: unknown; data?: unknown };
  const map = new Map<string, number>();
  if (!Array.isArray(fields) || !Array.isArray(data)) return map;
  const cikAt = fields.indexOf("cik");
  const tickerAt = fields.indexOf("ticker");
  for (const row of data) {
    if (!Array.isArray(row)) continue;
    const cik = row[cikAt];
    const ticker = row[tickerAt];
    if (typeof cik === "number" && typeof ticker === "string" && !map.has(ticker)) map.set(ticker, cik);
  }
  return map;
}

export function parseSic(json: unknown): number | null {
  const sic = Number((json as { sic?: unknown } | null)?.sic);
  return Number.isInteger(sic) && sic > 0 ? sic : null;
}

async function secJson(url: string) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`SEC answered ${response.status} for ${url}`);
  return response.json() as Promise<unknown>;
}

export async function fetchTickerMap() {
  return parseTickerMap(await secJson("https://www.sec.gov/files/company_tickers_exchange.json"));
}

/** The company's SIC code, or null when EDGAR has none. */
export async function fetchSic(cik: number) {
  return parseSic(await secJson(`https://data.sec.gov/submissions/CIK${String(cik).padStart(10, "0")}.json`));
}
