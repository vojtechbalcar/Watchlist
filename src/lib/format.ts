export type Direction = "up" | "down";

export function directionOf(value: number): Direction {
  return value < 0 ? "down" : "up";
}

/** Signed percentage, e.g. +15.20% / -1.39%. */
export function formatPct(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

export function formatPrice(value: number): string {
  return value.toFixed(2);
}
