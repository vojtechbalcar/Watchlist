import Image from "next/image";
import { formatPrice, formatPct, directionOf } from "@/lib/format";
import { benchmarkFor, type ExploreStock } from "@/lib/explore-data";

function LogoTile({
  stock,
  size,
  className = "rounded-logo bg-black",
}: {
  stock: ExploreStock;
  size: number;
  /** Radius and ground: cards use a small black tile, the hero a large one. */
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-clip ${className}`}
      style={{ width: size, height: size }}
    >
      {stock.logoSrc ? (
        <Image
          src={stock.logoSrc}
          alt=""
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.52)}
          style={{ width: Math.round(size * 0.72), height: Math.round(size * 0.52) }}
          className="object-contain"
        />
      ) : (
        <span className="font-data text-lg font-semibold text-surface-raised">
          {stock.ticker.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

/**
 * The stock's shape over the day. Exact vectors from Figma; Figma draws the
 * falling variant as the rising one mirrored, so this is one geometry flipped
 * rather than two paths. Placeholder geometry — see explore-data.ts.
 */
function CardTrend({ direction }: { direction: "up" | "down" }) {
  const up = direction === "up";

  return (
    <span
      aria-hidden
      className={[
        "block w-full",
        up ? "text-up" : "text-down",
        up ? "" : "scale-y-[-1]",
      ].join(" ")}
    >
      <svg viewBox="0 0 347 94" preserveAspectRatio="none" className="block h-[94px] w-full">
        <path d="M346 0V77.4962V94H0V77.4962L11.5333 64.5802H16.1467L31.14 52.7405H36.9067L43.8267 46.2824L49.5933 51.6641H51.9L58.82 40.9008L73.8133 59.1985L79.58 54.8931H93.42L103.8 65.6565L114.18 52.7405H121.1L125.713 48.4351L130.327 46.2824L136.093 49.5115L143.013 54.8931L149.933 46.2824L156.853 43.0534L163.773 37.6718H166.08L175.307 39.8244L179.92 37.6718L191.453 27.9847L198.373 24.7557L205.293 18.2977L226.053 33.3664L238.74 23.6794L249.12 33.3664H256.04L264.113 39.8244L282.567 24.7557H284.873L291.793 16.145L296.407 20.4504H301.02L305.633 26.9084L309.093 23.6794L317.167 17.2214L326.393 13.9924L331.007 9.68702L337.927 7.53435L346 0Z" fill="currentColor" fillOpacity={0.1} />
        <path
          d="M0.748044 78.8475L12.2814 65.8475H16.8947L31.888 53.9309H37.6547L44.5747 47.4309L50.3414 52.8475H52.648L59.3068 42.0142L74.5614 60.4309L80.328 56.0975H94.168L104.548 68.0142L114.928 53.9309H121.848L126.461 49.5975L131.075 47.4309L135.688 49.5975L140.301 53.9309L143.761 56.0975L151.835 46.3475L157.601 44.1809L163.368 38.7642H167.981L172.595 40.9309L179.515 39.8475L192.201 29.0142L196.815 26.8475L199.121 25.7642L206.041 19.2642L217.575 27.9309L225.648 34.4309H227.955L239.488 24.6809L249.868 34.4309H256.788L264.861 40.9309L283.315 25.7642H285.621L292.541 17.0975L297.155 21.4309H301.768L306.381 27.9309L315.608 19.2642L320.221 17.0975L327.141 14.9309L332.908 9.51421L338.675 8.43087L343.288 3.01421L346.748 0.847539"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

/** Small caret carrying the sign of today's move. */
export function MoveCaret({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 13 11"
      aria-hidden
      className={`block h-[11px] w-[13px] shrink-0 ${direction === "down" ? "rotate-180" : ""}`}
    >
      <path d="M6.49989 0L0 11H13L6.49989 0Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Add the stock to the watchlist, or show that it is already there.
 *
 * The added state is a filled tile with a check; the deep red of that mark is
 * an ownership badge, not a gain or a loss.
 */
export function AddToWatchlist({
  ticker,
  added,
  onToggle,
}: {
  ticker: string;
  added: boolean;
  onToggle: () => void;
}) {
  if (added) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed
        aria-label={`Remove ${ticker} from watchlist`}
        className="grid size-[51px] shrink-0 place-items-center rounded-logo border border-added-line bg-added-surface text-added-mark transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-added-mark"
      >
        <svg viewBox="0 0 31 22" aria-hidden className="block h-[16px] w-[22px]">
          <path
            d="M30.2899 0.636648C30.0848 0.434916 29.8409 0.274796 29.5721 0.165527C29.3033 0.056257 29.015 0 28.7238 0C28.4326 0 28.1443 0.056257 27.8755 0.165527C27.6067 0.274796 27.3627 0.434916 27.1576 0.636648L10.7244 16.6929L3.82028 9.93461C3.60737 9.73393 3.35604 9.57614 3.08063 9.47024C2.80523 9.36433 2.51114 9.3124 2.21516 9.31739C1.91919 9.32239 1.62712 9.38422 1.35563 9.49936C1.08415 9.61449 0.838559 9.78067 0.632893 9.98842C0.427228 10.1962 0.265512 10.4414 0.156978 10.7101C0.0484436 10.9789 -0.00478338 11.2658 0.000337307 11.5546C0.005458 11.8434 0.0688258 12.1284 0.186822 12.3933C0.304818 12.6582 0.475131 12.8978 0.688039 13.0985L9.15831 21.3634C9.36337 21.5651 9.60733 21.7252 9.87613 21.8345C10.1449 21.9437 10.4332 22 10.7244 22C11.0156 22 11.3039 21.9437 11.5727 21.8345C11.8415 21.7252 12.0855 21.5651 12.2906 21.3634L30.2899 3.80054C30.5138 3.59899 30.6925 3.35438 30.8147 3.08211C30.9369 2.80985 31 2.51583 31 2.21859C31 1.92136 30.9369 1.62734 30.8147 1.35507C30.6925 1.08281 30.5138 0.838195 30.2899 0.636648Z"
            fill="currentColor"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={false}
      aria-label={`Add ${ticker} to watchlist`}
      className="grid h-[49px] w-[52px] shrink-0 place-items-center rounded-tile border border-brand font-data text-title-sm leading-none font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span aria-hidden>+</span>
    </button>
  );
}

export function ExploreCard({
  stock,
  added,
  onToggle,
}: {
  stock: ExploreStock;
  added: boolean;
  onToggle: () => void;
}) {
  const dayDirection = directionOf(stock.changePct);
  const vsDirection = directionOf(stock.vsBenchmarkPct);

  return (
    <article
      className={[
        "flex h-[414px] flex-col rounded-card bg-surface-raised p-[27px] shadow-tile",
        stock.featured ? "xl:col-span-2" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <LogoTile stock={stock} size={60} />
          <div className="min-w-0">
            <h3 className="font-data text-2xl font-semibold tracking-tight text-ink">
              {stock.ticker}
            </h3>
            <p className="truncate font-data text-base font-light tracking-tight text-text-secondary">
              {stock.name}
            </p>
          </div>
        </div>

        <AddToWatchlist ticker={stock.ticker} added={added} onToggle={onToggle} />
      </div>

      <p className="mt-6 flex items-baseline gap-3">
        <span className="font-data text-price font-bold text-ink">
          {formatPrice(stock.price)}
        </span>
        <span
          className={[
            "flex items-center gap-1.5 font-data text-lg font-semibold",
            dayDirection === "up" ? "text-up" : "text-down",
          ].join(" ")}
        >
          <MoveCaret direction={dayDirection} />
          {formatPct(stock.changePct)}
        </span>
      </p>

      <div className="mt-auto">
        <CardTrend direction={dayDirection} />
      </div>

      <div className="mt-6 flex items-baseline justify-between border-t border-line-avatar pt-4">
        {/* Maroon names the index this stock is judged against: brand, not direction. */}
        <span className="font-data text-lg font-semibold text-brand">
          vs {benchmarkFor(stock)}
        </span>
        <span
          className={[
            "font-data text-lg font-bold",
            vsDirection === "up" ? "text-up" : "text-down",
          ].join(" ")}
        >
          {formatPct(stock.vsBenchmarkPct)}
        </span>
      </div>
    </article>
  );
}

export { LogoTile };
