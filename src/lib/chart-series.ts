import type { SeriesPoint } from "./market";

/**
 * Lines drawn together must share dates. The benchmark's dates are the axis;
 * each line is read at those dates, carrying its last value forward over a
 * missing day and null before its first one.
 */
export function alignTo(axis: SeriesPoint[], line: SeriesPoint[]): (number | null)[] {
  let at = 0;
  let last: number | null = null;
  return axis.map(([date]) => {
    while (at < line.length && line[at][0] <= date) last = line[at++][1];
    return last;
  });
}

/** Equal-weight average of aligned lines, ignoring lines without a value at that point. */
export function averageLines(lines: (number | null)[][]): (number | null)[] {
  const length = Math.max(0, ...lines.map(line => line.length));
  return Array.from({ length }, (_, i) => {
    const values = lines.map(line => line[i]).filter((value): value is number => value !== null && value !== undefined);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  });
}

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthYearFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

/** Up to four evenly spaced axis labels; month and year once the line spans more than six months. */
export function axisLabels(axis: SeriesPoint[], count = 4): { index: number; label: string }[] {
  if (axis.length === 0) return [];
  const long = Date.parse(axis.at(-1)![0]) - Date.parse(axis[0][0]) > 183 * 24 * 60 * 60 * 1000;
  const format = (date: string) => (long ? monthYearFormat : dayFormat).format(new Date(`${date}T00:00:00Z`)).replace(" ", long ? " ’" : " ");
  const indexes = axis.length === 1 ? [0] : [...new Set(Array.from({ length: count }, (_, i) => Math.round(i * (axis.length - 1) / (count - 1))))];
  return indexes.map(index => ({ index, label: format(axis[index][0]) }));
}

export type GapPoint = { at: number; line: number; base: number };

/**
 * The area between a line and its baseline, split where they cross so each band
 * is either ahead (line above base) or behind. `at` is an index into the series,
 * fractional at a crossing. A missing value on either line ends the band.
 */
export function gapBands(line: (number | null)[], base: (number | null)[]): { ahead: boolean; points: GapPoint[] }[] {
  const bands: { ahead: boolean; points: GapPoint[] }[] = [];
  let band: { ahead: boolean; points: GapPoint[] } | null = null;
  line.forEach((value, at) => {
    const baseValue = base[at];
    if (value === null || value === undefined || baseValue === null || baseValue === undefined) {
      band = null;
      return;
    }
    const gap = value - baseValue;
    if (band && (band.ahead ? gap < 0 : gap > 0)) {
      const last = band.points.at(-1)!;
      const lastGap = last.line - last.base;
      const t = lastGap / (lastGap - gap);
      const meet = last.line + t * (value - last.line);
      const crossing = { at: last.at + t * (at - last.at), line: meet, base: meet };
      band.points.push(crossing);
      band = { ahead: gap > 0, points: [crossing] };
      bands.push(band);
    }
    if (!band) {
      band = { ahead: gap >= 0, points: [] };
      bands.push(band);
    }
    band.points.push({ at, line: value, base: baseValue });
  });
  return bands;
}
