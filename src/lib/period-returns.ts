/**
 * Returns over the app's periods, computed from stored daily closes rather
 * than the demo fixtures in explore-performance.ts.
 */
export const periods = ["1D", "1W", "1M", "YTD", "1Y"] as const;
export type Period = (typeof periods)[number];

/** Oldest first. */
export type DatedClose = { date: string; close: number };

function shift(ymd: string, { days = 0, months = 0, years = 0 }) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year + years, month - 1 + months, day + days)).toISOString().slice(0, 10);
}

/**
 * The closes a period spans, from its starting close to the close on `end`
 * (or the latest before it). The start is the last close on or before the date
 * the period reaches back to: the previous session for 1D, the last close of
 * the prior year for YTD. Null when the history doesn't reach that far.
 */
export function periodWindow(closes: DatedClose[], period: Period, end?: string): DatedClose[] | null {
  const upTo = end ? closes.filter(row => row.date <= end) : closes;
  const last = upTo.at(-1);
  if (!last) return null;
  const startDate = {
    "1D": null,
    "1W": shift(last.date, { days: -7 }),
    "1M": shift(last.date, { months: -1 }),
    YTD: `${Number(last.date.slice(0, 4)) - 1}-12-31`,
    "1Y": shift(last.date, { years: -1 }),
  }[period];
  const earlier = upTo.slice(0, -1);
  const startAt = startDate === null ? earlier.length - 1 : earlier.findLastIndex(row => row.date <= startDate);
  if (startAt < 0 || upTo[startAt].close === 0) return null;
  return upTo.slice(startAt);
}

/** Percent return over the period; see periodWindow. */
export function periodReturn(closes: DatedClose[], period: Period, end?: string): number | null {
  const window = periodWindow(closes, period, end);
  return window ? (window.at(-1)!.close / window[0].close - 1) * 100 : null;
}

/** Stored as [["YYYY-MM-DD", close], …]; anything malformed is dropped. */
export function parseStoredCloses(value: unknown): DatedClose[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row): row is [string, number] => Array.isArray(row) && typeof row[0] === "string" && typeof row[1] === "number" && Number.isFinite(row[1]))
    .map(([date, close]) => ({ date, close }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
