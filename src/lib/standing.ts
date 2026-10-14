import type { Period } from "./period-returns";

/**
 * Where a stock stands against its benchmark: the app's one question. Every
 * gap, count, colour, and label comes from here, so "behind" means the same
 * thing on every page.
 */
export type Standing = "ahead" | "behind" | "level";

/** Stock return minus benchmark return, in percentage points to 2 dp; null when either is missing. */
export function gapBetween(stockReturn: number | null, benchmarkReturn: number | null): number | null {
  return stockReturn === null || benchmarkReturn === null ? null : Number((stockReturn - benchmarkReturn).toFixed(2));
}

/** Ahead above zero, behind below it, level at exactly zero; null without a gap. */
export function standingOf(gap: number | null): Standing | null {
  return gap === null ? null : gap > 0 ? "ahead" : gap < 0 ? "behind" : "level";
}

/** How many gaps fall each way. Missing gaps are counted apart, never as level. */
export function countStandings(gaps: (number | null)[]) {
  const counts = { ahead: 0, behind: 0, level: 0, unavailable: 0 };
  for (const gap of gaps) counts[standingOf(gap) ?? "unavailable"]++;
  return counts;
}

/** "+1.23", "−0.40", "0.00": the figure before " pp". */
export function formatGap(gap: number): string {
  return `${gap > 0 ? "+" : gap < 0 ? "−" : ""}${Math.abs(gap).toFixed(2)}`;
}

/**
 * The colour of any signed market figure, a gap or a day's move: green up, red
 * down, neutral at zero or without data. Market direction only, never brand.
 */
export function toneClass(value: number | null): string {
  return value === null || value === 0 ? "text-text-secondary" : value > 0 ? "text-up" : "text-down";
}

/** "Ahead", "Behind", "In line": a standing on its own. */
export const standingWord: Record<Standing, string> = { ahead: "Ahead", behind: "Behind", level: "In line" };

/** "Ahead of", "Behind", "In line with": a standing before the benchmark's name. */
export const standingPhrase: Record<Standing, string> = { ahead: "Ahead of", behind: "Behind", level: "In line with" };

/** The gap in percentage points that fills half a gap bar, so bars read the same across pages. */
export const gapBarScale: Record<Period, number> = { "1D": 3, "1W": 5, "1M": 10, YTD: 30, "1Y": 50 };

/** How far a gap bar reaches from its centre, as a share of the half-width (0 to 1). */
export function gapBarShare(gap: number, period: Period): number {
  return Math.min(Math.abs(gap) / gapBarScale[period], 1);
}
