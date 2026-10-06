"use client";

import { useEffect, useRef, useState } from "react";
import type { CompareRow, CompareRange } from "@/lib/compare-data";
import type { SeriesPoint } from "@/lib/market";
import { comparisonDomain, comparisonY } from "@/lib/compare-chart";
import { alignTo, axisLabels } from "@/lib/chart-series";
import { benchmarkTicker } from "@/lib/explore-data";
import { useMarketSeries } from "./market-provider";

/** Each selected stock's cumulative return against the benchmark's, on the benchmark's trading days. */
export function CompareChart({ rows, benchmarkLabel, range, extraSeries = {} }: {
  rows: CompareRow[]; benchmarkLabel: string; range: CompareRange;
  /** Lines for saved stocks outside the tracked set, which the market series doesn't carry. */
  extraSeries?: Record<string, Partial<Record<CompareRange, SeriesPoint[]>>>;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const lines = useMarketSeries();
  const [width, setWidth] = useState(980);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    if (svg.current) observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);
  const plotWidth = Math.max(1, width - 78);
  const right = 8 + plotWidth;

  const axis = lines?.series[benchmarkTicker(benchmarkLabel)]?.[range] ?? [];
  const benchmark = axis.map(([, value]) => value);
  const stockLines = rows.map(row => alignTo(axis, (lines?.series[row.series.ticker] ?? extraSeries[row.series.ticker])?.[range] ?? []));
  const domain = comparisonDomain([...benchmark, ...stockLines.flat().filter((value): value is number => value !== null), ...rows.flatMap(row => row.returnPct ?? [])]);
  const x = (index: number) => 8 + (axis.length > 1 ? index / (axis.length - 1) : 1) * plotWidth;
  const points = (data: (number | null)[]) => data.flatMap((value, i) => value === null ? [] : [`${x(i)},${comparisonY(value, domain)}`]).join(" ");
  const ticks = Array.from({ length: 5 }, (_, i) => domain.min + (domain.max - domain.min) * i / 4)
    .filter(value => value === 0 || Math.abs(comparisonY(value, domain) - comparisonY(0, domain)) >= 16);

  return <figure className="comparison-chart"><svg ref={svg} viewBox={`0 0 ${width} 250`} preserveAspectRatio="none" role="img" aria-label={`${range} returns for ${rows.map(r => r.series.ticker).join(", ")} and ${benchmarkLabel}`}>
    {ticks.map(value => <g key={value}><line x1="8" x2={right} y1={comparisonY(value, domain)} y2={comparisonY(value, domain)} stroke="var(--color-line-soft)" strokeDasharray="4 6" /><text x={width - 4} y={comparisonY(value, domain) + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">{value}%</text></g>)}
    <line x1="8" x2={right} y1={comparisonY(0, domain)} y2={comparisonY(0, domain)} stroke="var(--color-line)" />
    {!ticks.includes(0) && <text x={width - 4} y={comparisonY(0, domain) + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">0%</text>}
    {axis.length > 1 ? <>
      <polyline points={points(benchmark)} fill="none" stroke="var(--color-chart-benchmark)" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
      {rows.map((row, index) => {
        const line = stockLines[index];
        const last = line.findLast(value => value !== null);
        return <g key={row.series.ticker}><polyline points={points(line)} fill="none" stroke={row.series.colorVar} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />{last !== undefined && last !== null && <circle cx={right} cy={comparisonY(last, domain)} r="3" fill={row.series.colorVar} />}</g>;
      })}
      {axisLabels(axis).map(({ index, label }, i, all) => <text key={index} x={x(index)} y="246" textAnchor={i === 0 ? "start" : i === all.length - 1 ? "end" : "middle"} fill="var(--color-text-muted)" fontSize="10">{label}</text>)}
    </> : <text x={width / 2} y="120" textAnchor="middle" fill="var(--color-text-muted)" fontSize="12">{lines ? "The chart appears once prices for this period are in." : "Loading chart…"}</text>}
  </svg></figure>;
}
