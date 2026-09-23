/** Locally cached, monochrome brand SVGs. See public/logos/symbols/README.md. */
const symbolTickers = new Set([
  "AAPL",
  "ABBV",
  "ADBE",
  "AEP",
  "AMD",
  "AMT",
  "AMZN",
  "AVGO",
  "BA",
  "BAC",
  "CAT",
  "COP",
  "COST",
  "CRM",
  "CVX",
  "DE",
  "DUK",
  "EOG",
  "EQIX",
  "EXC",
  "GOOGL",
  "GS",
  "HD",
  "HON",
  "INTC",
  "JNJ",
  "JPM",
  "LLY",
  "META",
  "MRK",
  "MS",
  "MSFT",
  "NEE",
  "NKE",
  "NVDA",
  "O",
  "PFE",
  "PLD",
  "QCOM",
  "SBUX",
  "SLB",
  "SO",
  "SPG",
  "TSLA",
  "TSM",
  "UNH",
  "UPS",
  "V",
  "XOM"
]);

export function stockLogoSrc(ticker: string): string | null {
  const normalized = ticker.toUpperCase();
  return symbolTickers.has(normalized) ? `/logos/symbols/${normalized.toLowerCase()}.svg` : null;
}

/** Optical sizing: dense marks need more air; wide marks need more horizontal room. */
export function stockLogoFit(ticker: string): "compact" | "wide" | "standard" {
  if (["MSFT", "AMD", "ADBE", "AVGO", "SBUX", "HD", "CAT"].includes(ticker)) return "compact";
  if (["META", "NKE", "BA", "INTC", "V", "COST", "XOM", "LLY", "TSM", "AEP", "SLB", "COP", "EXC", "SPG"].includes(ticker)) return "wide";
  return "standard";
}
