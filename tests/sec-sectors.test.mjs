import assert from "node:assert/strict";
import test from "node:test";
import { parseSic, parseTickerMap, secTicker, sectorForSic } from "../src/lib/sec-sectors.ts";

test("the tracked stocks' SEC codes land in their hand-picked sectors", () => {
  // SIC codes EDGAR returned on 2026-10-01 for the demo catalog.
  const known = {
    MSFT: [7372, "Technology"], AAPL: [3571, "Technology"], GOOGL: [7370, "Technology"],
    NVDA: [3674, "Semiconductors"], LLY: [2834, "Healthcare"], UNH: [6324, "Healthcare"],
    JPM: [6021, "Financials"], GS: [6211, "Financials"], AMZN: [5961, "Consumer"], NKE: [3021, "Consumer"],
    SBUX: [5810, "Consumer"], XOM: [2911, "Energy"], SLB: [1389, "Energy"], EOG: [1311, "Energy"],
    CAT: [3531, "Industrials"], BA: [3721, "Industrials"], UPS: [4210, "Industrials"],
    NEE: [4911, "Utilities"], EXC: [4931, "Utilities"], AMT: [6798, "Real Estate"],
  };
  for (const [ticker, [sic, sector]] of Object.entries(known)) assert.equal(sectorForSic(sic), sector, ticker);
});

test("SPACs, shells, and missing codes have no sector", () => {
  assert.equal(sectorForSic(6770), null);
  assert.equal(sectorForSic(9995), null);
  assert.equal(sectorForSic(null), null);
  assert.equal(sectorForSic(8111), null); // legal services
});

test("pipelines are energy even inside the utilities range", () => {
  assert.equal(sectorForSic(4922), "Energy");
  assert.equal(sectorForSic(4924), "Utilities");
});

test("the SEC ticker map is read by field name", () => {
  const map = parseTickerMap({ fields: ["cik", "name", "ticker", "exchange"], data: [[320193, "Apple Inc.", "AAPL", "Nasdaq"], [1067983, "BERKSHIRE", "BRK-B", "NYSE"], ["bad"]] });
  assert.equal(map.get("AAPL"), 320193);
  assert.equal(map.get(secTicker("BRK.B")), 1067983);
  assert.equal(parseTickerMap(null).size, 0);
});

test("SIC codes parse from EDGAR's string field", () => {
  assert.equal(parseSic({ sic: "3571" }), 3571);
  assert.equal(parseSic({ sic: "" }), null);
  assert.equal(parseSic(null), null);
});
