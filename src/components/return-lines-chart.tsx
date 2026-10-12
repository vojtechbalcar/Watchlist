"use client";

import { useEffect, useRef, useState } from "react";
import { axisLabels, gapBands } from "@/lib/chart-series";
import type { SeriesPoint } from "@/lib/market";

/**
 * A line's cumulative return against its benchmark's, with the gap between
 * them shaded green where the line is ahead and red where it is behind. The
 * benchmark's dates are the axis; `line` is read at those dates (see alignTo).
 */
export function ReturnLinesChart({ axis, line, label, empty }: {
  axis: SeriesPoint[];
  line: (number | null)[];
  /** Describes the chart for screen readers. */
  label: string;
  /** Shown instead of the lines when there are fewer than two points. */
  empty: string;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(980);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    if (svg.current) observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);
  const right = Math.max(9, width - 62);
  const benchValues = axis.map(([, value]) => value);
  const plotted = [...line, ...benchValues].filter((value): value is number => value !== null);
  const max = Math.ceil(Math.max(0, ...plotted) / 4) * 4 || 4;
  const min = Math.floor(Math.min(0, ...plotted) / 4) * 4;
  const y = (value: number) => 200 - (value - min) / (max - min) * 180;
  const x = (index: number) => 8 + (axis.length > 1 ? index / (axis.length - 1) : 1) * (right - 8);
  const points = (data: (number | null)[]) => data.flatMap((value, i) => value === null ? [] : [`${x(i)},${y(value)}`]).join(" ");
  const lastValue = line.findLast(value => value !== null) ?? null;

  return <figure>
    <svg ref={svg} viewBox={`0 0 ${width} 235`} className="block w-full h-[240px] sm:h-[260px]" preserveAspectRatio="none" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="8" x2={right} y1={200 - i * 45} y2={200 - i * 45} stroke="var(--color-chart-grid)" strokeDasharray="4 6" /><text x={width - 4} y={204 - i * 45} textAnchor="end" fill="var(--color-text-muted)" fontSize="11">{min + (max - min) / 4 * i}%</text></g>)}
      {axis.length > 1 && <>
        {gapBands(line, benchValues).map((band, i) => <polygon key={i} points={[...band.points.map(p => `${x(p.at)},${y(p.line)}`), ...band.points.toReversed().map(p => `${x(p.at)},${y(p.base)}`)].join(" ")} fill={band.ahead ? "var(--color-up-surface)" : "var(--color-down-surface)"} />)}
        <polyline points={points(benchValues)} fill="none" stroke="var(--color-chart-benchmark)" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        <polyline points={points(line)} fill="none" stroke="var(--color-chart-watchlist)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {lastValue !== null && <circle cx={right} cy={y(lastValue)} r="3.5" fill="var(--color-ink)" stroke="var(--color-surface)" strokeWidth="2" />}
        <circle cx={right} cy={y(benchValues.at(-1)!)} r="3" fill="var(--color-chart-benchmark)" stroke="var(--color-surface)" strokeWidth="2" />
        {axisLabels(axis).map(({ index, label }, i, all) => <text key={index} x={x(index)} y="230" textAnchor={i === 0 ? "start" : i === all.length - 1 ? "end" : "middle"} fill="var(--color-text-muted)" fontSize="10">{label}</text>)}
      </>}
      {axis.length <= 1 && <text x={width / 2} y="110" textAnchor="middle" fill="var(--color-text-muted)" fontSize="12">{empty}</text>}
    </svg>
  </figure>;
}
