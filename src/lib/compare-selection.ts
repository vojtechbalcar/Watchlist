import { compareColors } from "./compare-data";

export const comparisonLimit = compareColors.length;
export type ComparisonSelection = { ticker: string; colorSlot: number }[];

export function initialComparison(tickers: string[]): ComparisonSelection {
  return [...new Set(tickers)].slice(0, comparisonLimit).map((ticker, colorSlot) => ({ ticker, colorSlot }));
}

/** A membership change removes stale selections without replacing other choices. */
export function reconcileComparison(selection: ComparisonSelection, saved: string[]): ComparisonSelection {
  return selection.filter(item => saved.includes(item.ticker));
}

export function addComparisonStock(selection: ComparisonSelection, ticker: string, saved: string[]): ComparisonSelection {
  const active = reconcileComparison(selection, saved);
  if (!saved.includes(ticker) || active.some(item => item.ticker === ticker) || active.length >= comparisonLimit) return active;
  const colorSlot = compareColors.findIndex((_, index) => !active.some(item => item.colorSlot === index));
  return [...active, { ticker, colorSlot }];
}
