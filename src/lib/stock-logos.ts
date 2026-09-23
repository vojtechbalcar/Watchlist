/** Locally cached, monochrome brand SVGs. See public/logos/symbols/README.md. */
const symbolTickers = new Set([
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "META",
  "ADBE",
  "CRM",
  "AMD",
  "AVGO",
  "INTC",
  "QCOM",
  "MRK",
  "ABBV",
  "GS",
  "BAC",
  "V",
  "AMZN",
  "NKE",
  "SBUX",
  "CAT",
  "BA",
  "DE",
  "UPS",
  "TSLA"
]);

export function stockLogoSrc(ticker: string): string | null {
  const normalized = ticker.toUpperCase();
  return symbolTickers.has(normalized) ? `/logos/symbols/${normalized.toLowerCase()}.svg` : null;
}
