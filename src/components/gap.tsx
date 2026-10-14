import { formatGap, toneClass } from "@/lib/standing";

/** A gap to the benchmark as "+1.23 pp", coloured by direction; a dash without data. */
export function Gap({ value }: { value: number | null }) {
  if (value === null) return <span className="text-text-faint">—</span>;
  return <span className={toneClass(value)}>{formatGap(value)} <small>pp</small></span>;
}
