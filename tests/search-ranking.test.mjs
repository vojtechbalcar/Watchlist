import assert from "node:assert/strict";
import test from "node:test";
import { isPriceFresh, normalizeQuery, rankCandidates } from "../src/lib/search-ranking.ts";

const stock = (symbol, name, tracked = false) => ({ symbol, name, tracked });

test("exact tickers beat ticker prefixes, which beat name matches", () => {
  const ranked = rankCandidates("app", [
    stock("APPN", "Appian Corporation"),
    stock("AAPL", "Apple Inc.", true),
    stock("APP", "AppLovin Corporation"),
    stock("MAPP", "Snapp Holdings"),
  ]);
  assert.deepEqual(ranked.map(row => row.symbol), ["APP", "APPN", "AAPL", "MAPP"]);
});

test("among equal matches tracked stocks come first, then shorter tickers", () => {
  const ranked = rankCandidates("micro", [
    stock("MCHP", "Microchip Technology"),
    stock("MSFT", "Microsoft Corporation", true),
    stock("MU", "Micron Technology"),
  ]);
  assert.deepEqual(ranked.map(row => row.symbol), ["MSFT", "MU", "MCHP"]);
});

test("a name that starts with the query beats one with it in a later word", () => {
  const ranked = rankCandidates("micro", [stock("AMD", "Advanced Micro Devices", true), stock("MSFT", "Microsoft Corporation", true)]);
  assert.deepEqual(ranked.map(row => row.symbol), ["MSFT", "AMD"]);
});

test("non-matches are dropped and results are capped", () => {
  const many = Array.from({ length: 10 }, (_, i) => stock(`A${i}`, `Alpha ${i}`));
  assert.equal(rankCandidates("a", many).length, 6);
  assert.deepEqual(rankCandidates("zzz", [stock("AAPL", "Apple Inc.")]), []);
});

test("queries are trimmed and length-limited", () => {
  assert.equal(normalizeQuery("  nvda  "), "nvda");
  assert.equal(normalizeQuery(null), "");
  assert.equal(normalizeQuery("x".repeat(100)).length, 40);
});

test("search prices are reused for 15 minutes", () => {
  const now = new Date("2026-10-01T15:00:00Z");
  assert.equal(isPriceFresh(null, now), false);
  assert.equal(isPriceFresh(new Date("2026-10-01T14:50:00Z"), now), true);
  assert.equal(isPriceFresh(new Date("2026-10-01T14:45:00Z"), now), false);
});
