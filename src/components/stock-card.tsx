import Image from "next/image";
import { Sparkline } from "./sparkline";
import { formatPrice, formatDelta, formatPct, directionOf } from "@/lib/format";
import type { Holding } from "@/lib/watchlist-data";

function LogoTile({ holding }: { holding: Holding }) {
  return (
    <span className="grid size-[54px] shrink-0 place-items-center rounded-logo bg-black">
      {holding.logoSrc ? (
        <Image
          src={holding.logoSrc}
          alt=""
          width={28}
          height={28}
          className="size-[28px] object-contain"
        />
      ) : (
        <span className="font-data text-base font-semibold text-surface-raised">
          {holding.ticker.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

export function StockCard({ holding, benchmarkLabel }: { holding: Holding; benchmarkLabel: string }) {
  const dayDirection = directionOf(holding.changePct);
  const vsDirection = directionOf(holding.vsBenchmarkPct);

  return (
    <article className="flex flex-col rounded-tile border border-line bg-surface-raised p-6 shadow-tile">
      <div className="flex items-start gap-4">
        <LogoTile holding={holding} />
        <div className="min-w-0">
          <h3 className="font-data text-xl font-semibold tracking-tight text-ink">
            {holding.ticker}
          </h3>
          <p className="truncate font-data text-xs font-light tracking-tight text-text-secondary">
            {holding.name}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-data text-2xl font-semibold text-ink">
          {formatPrice(holding.price)}
        </span>
        <span className="font-data text-sm font-light tracking-tight text-text-secondary">
          {holding.currency}
        </span>
      </div>

      <p
        className={[
          "mt-1 font-data text-xs font-medium tracking-loose",
          dayDirection === "up" ? "text-up" : "text-down-deep",
        ].join(" ")}
      >
        {formatDelta(holding.changeAbs, holding.changePct)}
      </p>

      <div className="mt-6">
        <Sparkline direction={dayDirection} />
      </div>

      <div className="mt-auto flex items-baseline justify-between border-t border-line-soft pt-3">
        <span className="text-base font-bold text-brand">vs {benchmarkLabel}</span>
        <span
          className={[
            "font-data text-base font-bold",
            vsDirection === "up" ? "text-up" : "text-down",
          ].join(" ")}
        >
          {formatPct(holding.vsBenchmarkPct)}
        </span>
      </div>
    </article>
  );
}
