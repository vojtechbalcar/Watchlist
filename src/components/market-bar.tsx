import { formatPct, directionOf } from "@/lib/format";
import type { MarketIndex } from "@/lib/watchlist-data";

export function MarketBar({ indices }: { indices: MarketIndex[] }) {
  return (
    <div className="h-marketbar border-b border-line">
      <div className="mx-auto flex h-full max-w-(--container-page) items-center px-8">
        <span className="shrink-0 pr-8 text-base tracking-ticker text-text-faint">
          MARKETS
        </span>

        <dl className="flex h-[28px] min-w-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {indices.map((index) => {
            const direction = directionOf(index.changePct);
            return (
              <div
                key={index.label}
                className="flex shrink-0 items-baseline gap-3 border-l border-line px-6 whitespace-nowrap"
              >
                <dt className="font-data text-base font-semibold tracking-ticker text-text-ticker">
                  {index.label}
                </dt>
                <dd className="font-data text-base tracking-ticker text-text-numeric">
                  {index.value}
                </dd>
                <dd
                  className={[
                    "font-data text-base font-semibold tracking-ticker",
                    direction === "up" ? "text-up" : "text-down",
                  ].join(" ")}
                >
                  {formatPct(index.changePct)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
