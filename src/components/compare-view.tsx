"use client";

import { useId, useMemo, useState } from "react";
import { CompareChart } from "./compare-chart";
import { FullComparisonTable } from "./full-comparison-table";
import { formatPct, directionOf } from "@/lib/format";
import {
  compareBenchmark,
  compareRanges,
  compareRows,
  compareSeries,
  type CompareRange,
  type CompareRow,
} from "@/lib/compare-data";

function SeriesDot({ colorVar, size = 16 }: { colorVar: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="block shrink-0 rounded-full"
      style={{ backgroundColor: colorVar, width: size, height: size }}
    />
  );
}

function RemoveX({
  label,
  onRemove,
  disabled,
  disabledReason,
}: {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled}
      aria-label={label}
      title={disabled ? disabledReason : undefined}
      className="grid size-[18px] shrink-0 place-items-center rounded-full text-pill-remove transition-colors not-disabled:hover:text-ink disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <svg viewBox="0 0 10 8" aria-hidden className="block size-[9px]">
        <path d="M2 1L8 7M8 1L2 7" stroke="currentColor" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function PillRow({
  label,
  tone = "plain",
  children,
}: {
  label: string;
  tone?: "plain" | "filled";
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xl text-text-faint">{label}</p>
      <div
        className={[
          "mt-2 flex min-h-[67px] flex-wrap items-center gap-3 rounded-pill-row border border-line-avatar px-4",
          tone === "filled" ? "bg-pill-row" : "",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function RangeSelector({
  range,
  onChange,
}: {
  range: CompareRange;
  onChange: (next: CompareRange) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-6" role="group" aria-label="Range">
      {compareRanges.map((option) => {
        const isActive = option === range;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={[
              "relative py-1 text-base font-medium transition-colors",
              isActive ? "text-brand" : "text-text-faint hover:text-ink",
            ].join(" ")}
          >
            {option}
            {isActive && (
              <span aria-hidden className="absolute inset-x-0 -bottom-1 h-[3px] bg-brand" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Callout({ row, benchmarkLabel, range }: { row: CompareRow; benchmarkLabel: string; range: CompareRange }) {
  const direction = directionOf(row.vsBenchmarkPct);

  return (
    <div className="flex-1 px-8 first:pl-0 last:pr-0">
      <p className="flex items-center gap-4">
        <SeriesDot colorVar={row.series.colorVar} />
        {/* Maroon names the benchmark pairing: brand, not direction. */}
        <span className="text-base font-medium text-brand">
          {row.series.ticker} VS {benchmarkLabel}
        </span>
      </p>
      <p className="mt-3 flex flex-wrap items-baseline gap-3">
        <span
          className={[
            "font-data text-title-sm font-bold",
            direction === "up" ? "text-up" : "text-down",
          ].join(" ")}
        >
          {formatPct(row.vsBenchmarkPct)}
        </span>
        <span className="font-data text-xl text-text-muted">
          {direction === "up" ? "ahead" : "behind"} over {range}
        </span>
      </p>
    </div>
  );
}

export function CompareView({ initialRange }: { initialRange: CompareRange }) {
  const [range, setRange] = useState<CompareRange>(initialRange);
  const [selected, setSelected] = useState<string[]>(
    compareSeries.map((series) => series.ticker),
  );
  const [draft, setDraft] = useState("");
  const listId = useId();

  const rows = useMemo(() => compareRows(range, selected), [range, selected]);
  const available = compareSeries.filter((s) => !selected.includes(s.ticker));
  const beating = rows.filter((row) => row.vsBenchmarkPct > 0).length;

  function addStock(value: string) {
    const match = available.find(
      (s) => s.ticker.toLowerCase() === value.trim().toLowerCase(),
    );
    if (!match) return;
    // Rebuild from compareSeries so the pills keep their canonical order.
    setSelected((prev) =>
      compareSeries
        .map((s) => s.ticker)
        .filter((ticker) => prev.includes(ticker) || ticker === match.ticker),
    );
    setDraft("");
  }

  return (
    <>
      <h1 className="text-title font-bold text-ink">Compare</h1>

      <section className="mt-12 rounded-card border border-line bg-surface-raised px-6 py-10 shadow-card sm:px-10 xl:px-[58px] xl:py-[44px]">
        <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-10">
          <div className="w-full max-w-[971px] flex-1 space-y-8">
            <PillRow label="STOCKS">
              {rows.map((row) => (
                <span
                  key={row.series.ticker}
                  className="flex h-[43px] items-center gap-4 rounded-full border border-line-avatar bg-pill pr-4 pl-[17px]"
                >
                  <SeriesDot colorVar={row.series.colorVar} />
                  <span className="text-xl font-bold text-ink">{row.series.ticker}</span>
                  <RemoveX
                    label={`Remove ${row.series.ticker} from the comparison`}
                    onRemove={() =>
                      setSelected((prev) => prev.filter((t) => t !== row.series.ticker))
                    }
                    disabled={selected.length === 1}
                    disabledReason="A comparison needs at least one stock"
                  />
                </span>
              ))}

              <label className="relative flex min-w-[220px] flex-1 items-center">
                <span className="sr-only">Add another stock</span>
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden
                  className="pointer-events-none absolute left-2 size-[18px] text-text-faint"
                >
                  <path
                    d="M19.7192 18.3139L16.0114 14.6333C17.4506 12.8374 18.1476 10.5579 17.959 8.26356C17.7705 5.96919 16.7106 3.83432 14.9975 2.29792C13.2844 0.761532 11.0481 -0.0595993 8.74862 0.00337152C6.4491 0.0663423 4.26109 1.00863 2.63448 2.63648C1.00786 4.26433 0.066292 6.454 0.00336896 8.75527C-0.059554 11.0565 0.760954 13.2945 2.29618 15.0089C3.83141 16.7233 5.96466 17.784 8.25729 17.9727C10.5499 18.1614 12.8277 17.4639 14.6222 16.0235L18.3 19.7042C18.3929 19.7979 18.5035 19.8723 18.6253 19.9231C18.747 19.9739 18.8777 20 19.0096 20C19.1415 20 19.2722 19.9739 19.3939 19.9231C19.5157 19.8723 19.6263 19.7979 19.7192 19.7042C19.8993 19.5177 20 19.2684 20 19.009C20 18.7497 19.8993 18.5004 19.7192 18.3139ZM9.01554 16.0235C7.63189 16.0235 6.27932 15.6129 5.12886 14.8436C3.9784 14.0743 3.08172 12.9809 2.55223 11.7016C2.02273 10.4223 1.88419 9.01462 2.15412 7.65653C2.42406 6.29844 3.09035 5.05095 4.06873 4.07183C5.04712 3.0927 6.29366 2.4259 7.65072 2.15576C9.00778 1.88562 10.4144 2.02426 11.6927 2.55417C12.9711 3.08407 14.0637 3.98142 14.8324 5.13276C15.6011 6.28409 16.0114 7.63769 16.0114 9.02239C16.0114 10.8792 15.2743 12.66 13.9623 13.973C12.6504 15.2859 10.871 16.0235 9.01554 16.0235Z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  type="text"
                  list={listId}
                  value={draft}
                  disabled={available.length === 0}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    addStock(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addStock(draft);
                    }
                  }}
                  placeholder={available.length === 0 ? "All stocks added" : "Add another..."}
                  className="h-[43px] w-full bg-transparent pl-9 font-data text-sm font-light text-ink placeholder:text-text-faint focus-visible:outline-none"
                />
                <datalist id={listId}>
                  {available.map((series) => (
                    <option key={series.ticker} value={series.ticker} />
                  ))}
                </datalist>
              </label>
            </PillRow>

            {/* One index, and every figure on this page is defined against it,
                so the benchmark is fixed in this build. */}
            <PillRow label="BENCHMARKS" tone="filled">
              <span className="flex h-[37px] items-center gap-4 rounded-logo border border-line-avatar bg-surface-raised pr-3 pl-3">
                <span aria-hidden className="flex items-center gap-1">
                  <span className="block h-[3px] w-[7px] bg-series-benchmark" />
                  <span className="block h-[3px] w-[7px] bg-series-benchmark" />
                </span>
                <span className="text-lg font-bold text-ink">{compareBenchmark.label}</span>
                <RemoveX
                  label={`Remove ${compareBenchmark.label}`}
                  disabled
                  disabledReason="A comparison needs a benchmark"
                />
              </span>
              <span className="px-2 font-data text-sm font-light text-text-faint">
                Add another index...
              </span>
            </PillRow>
          </div>

          <div className="ml-auto">
            <RangeSelector range={range} onChange={setRange} />

            <div className="mt-14 text-right">
              <p className="flex items-baseline justify-end gap-2">
                <span className="text-display font-bold text-black">{beating}</span>
                <span className="text-title-sm text-text-faint">of {rows.length}</span>
              </p>
              <p className="mt-1 text-xl text-text-caption">
                beating {compareBenchmark.label} this period
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <CompareChart rows={rows} benchmarkLabel={compareBenchmark.label} range={range} />
        </div>

        <div className="mt-6 flex flex-wrap divide-x divide-line-soft border-t border-line-soft pt-8">
          {rows.map((row) => (
            <Callout
              key={row.series.ticker}
              row={row}
              benchmarkLabel={compareBenchmark.label}
              range={range}
            />
          ))}
        </div>
      </section>

      <div className="mt-20 flex items-baseline gap-6">
        <h2 className="text-title-sm font-bold text-ink">Full comparison</h2>
        <p className="text-xl font-bold text-text-faint">{range}</p>
      </div>

      <div className="mt-8">
        <FullComparisonTable rows={rows} benchmarkLabel={compareBenchmark.label} />
      </div>
    </>
  );
}
