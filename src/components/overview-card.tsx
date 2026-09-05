import { PerformanceChart, ChartLegend } from "./performance-chart";
import { formatPct, formatPctBare, directionOf } from "@/lib/format";
import { ranges, type OverviewSummary, type Standout } from "@/lib/watchlist-data";

function CaretUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12.7 11" aria-hidden className={className}>
      <path d="M6.35083 0L0 11H12.7017L6.35083 0Z" fill="currentColor" />
    </svg>
  );
}

function StandoutBlock({
  label,
  standout,
  benchmarkLabel,
}: {
  label: string;
  standout: Standout;
  benchmarkLabel: string;
}) {
  const todayDirection = directionOf(standout.todayPct);
  const vsDirection = directionOf(standout.vsBenchmarkPct);

  return (
    <div className="flex flex-1 flex-wrap items-center justify-between gap-x-8 gap-y-3">
      <div>
        <p className="text-base font-medium text-text-faint">{label}</p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-ink-strong">{standout.ticker}</span>
          <span className="text-xs text-text-faint">{standout.name}</span>
          <span
            className={[
              "inline-flex items-center gap-1.5 font-data text-xs",
              todayDirection === "up" ? "text-up" : "text-down",
            ].join(" ")}
          >
            <CaretUp
              className={[
                "h-[11px] w-[12.7px]",
                todayDirection === "down" && "rotate-180",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            {formatPctBare(standout.todayPct)} today
          </span>
        </div>
      </div>
      <span
        className={[
          "font-data text-xl font-semibold whitespace-nowrap",
          vsDirection === "up" ? "text-up" : "text-down",
        ].join(" ")}
      >
        {formatPct(standout.vsBenchmarkPct)} vs {benchmarkLabel}
      </span>
    </div>
  );
}

export function OverviewCard({ summary }: { summary: OverviewSummary }) {
  const leadDirection = directionOf(summary.leadPct);
  const ahead = summary.leadPct >= 0;

  return (
    <section className="rounded-card border border-line bg-surface-raised shadow-card">
      <div className="flex flex-col gap-8 p-6 sm:p-8 xl:p-12">
        {/* headline row */}
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0">
            <h2 className="text-xl text-text-faint">
              WATCHLIST VS {summary.benchmarkLabel.toUpperCase()}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-data text-title font-semibold text-ink-strong sm:text-display">
                {formatPct(summary.watchlistPct)}
              </span>
              <span aria-hidden className="h-[48px] w-[3px] bg-line sm:h-[64px]" />
              <span
                className={[
                  "font-data text-title font-semibold sm:text-display",
                  leadDirection === "up" ? "text-up" : "text-down",
                ].join(" ")}
              >
                {formatPct(summary.leadPct)}
              </span>
              <span
                className={[
                  "font-data text-xl font-semibold",
                  leadDirection === "up" ? "text-up" : "text-down",
                ].join(" ")}
              >
                VS MARKET
              </span>
            </div>

            <p className="mt-4 font-data text-xl font-medium text-text-secondary">
              {ahead
                ? "You’re ahead of index this period."
                : "You’re behind the index this period."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-8">
            <nav aria-label="Time range" className="flex items-center gap-8">
              {ranges.map((range) => {
                const isActive = range === summary.range;
                return (
                  <button
                    key={range}
                    type="button"
                    aria-pressed={isActive}
                    className={[
                      "relative py-2 text-base font-medium transition-colors",
                      isActive ? "text-brand" : "text-text-faint hover:text-ink",
                    ].join(" ")}
                  >
                    {range}
                    {isActive && (
                      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-brand" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="text-right">
              <p>
                <span className="text-title font-bold text-black sm:text-display">{summary.beating}</span>
                <span className="ml-2 text-title-sm text-text-faint">of {summary.total}</span>
              </p>
              <p className="mt-1 text-xl text-text-caption">
                beating the market this year-to-date
              </p>
            </div>
          </div>
        </div>

        <ChartLegend benchmarkLabel={summary.benchmarkLabel} />

        <PerformanceChart />
      </div>

      {/* standouts */}
      <div className="flex flex-col items-stretch gap-8 border-t border-line px-6 py-8 sm:px-8 lg:flex-row xl:px-12">
        <StandoutBlock
          label="BEST VS MARKET TODAY"
          standout={summary.bestVsMarket}
          benchmarkLabel={summary.benchmarkLabel}
        />
        <span aria-hidden className="hidden w-px self-stretch bg-line lg:block" />
        <StandoutBlock
          label="GREEN TODAY, STILL LAGGING"
          standout={summary.greenButLagging}
          benchmarkLabel={summary.benchmarkLabel}
        />
      </div>
    </section>
  );
}
