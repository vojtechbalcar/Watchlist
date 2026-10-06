import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./resolve-typescript.mjs", import.meta.url);
const { setupCandidates } = await import("../src/lib/setup-candidates.ts");

const stock = (symbol, name, sector, tracked = false) => ({ symbol, name, exchange: "NYSE", sector, tracked });
const directory = [
  stock("MSFT", "Microsoft Corp", "Technology", true),
  stock("ADBE", "Adobe Inc", "Technology"),
  stock("AAP", "Advance Auto Parts Inc", "Consumer"),
  stock("AMD", "Advanced Micro Devices Inc", "Semiconductors"),
  stock("SHELL", "Shell Co", null),
];

test("without a search or sectors, setup suggests only the featured stocks", () => {
  assert.deepEqual(setupCandidates(directory, { interests: [], query: "", shown: 30 }), { stocks: [], total: 0 });
});

test("chosen sectors list their untracked stocks, a page at a time", () => {
  assert.deepEqual(setupCandidates(directory, { interests: ["Technology", "Consumer"], query: "", shown: 1 }), { stocks: [directory[1]], total: 2 });
});

test("a search reaches every untracked stock, best match first, within the chosen sectors", () => {
  assert.deepEqual(setupCandidates(directory, { interests: [], query: "adv", shown: 30 }).stocks.map(s => s.symbol), ["AAP", "AMD"]);
  assert.deepEqual(setupCandidates(directory, { interests: ["Semiconductors"], query: "adv", shown: 30 }).stocks.map(s => s.symbol), ["AMD"]);
  assert.deepEqual(setupCandidates(directory, { interests: [], query: "shell", shown: 30 }).stocks.map(s => s.symbol), ["SHELL"]);
});
