export type Direction = "up" | "down";

export function directionOf(value: number): Direction {
  return value < 0 ? "down" : "up";
}

/** Signed percentage, e.g. +15.20% / -1.39%. */
export function formatPct(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

/** Unsigned percentage for "3.83% today", where a caret carries the sign. */
export function formatPctBare(value: number, decimals = 2): string {
  return `${Math.abs(value).toFixed(decimals)}%`;
}

export function formatPrice(value: number): string {
  return value.toFixed(2);
}

/** Intraday move: "−1.08 (-0.35%)". */
export function formatDelta(abs: number, pct: number): string {
  const sign = abs < 0 ? "−" : "+";
  return `${sign}${Math.abs(abs).toFixed(2)} (${sign}${Math.abs(pct).toFixed(2)}%)`;
}
