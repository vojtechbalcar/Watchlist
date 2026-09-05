"use client";

import { useMemo, useState } from "react";
import { ExploreCard, AddToWatchlist, MoveCaret, LogoTile } from "./explore-card";
import { ExploreHeroChart } from "./explore-hero-chart";
import { formatPrice, formatPct, formatPctBare, directionOf } from "@/lib/format";
import {
  benchmarkFor,
  biggestMarketBeater,
  exploreUniverse,
  moreSectors,
  primarySectors,
  type ExploreStock,
  type Sector,
} from "@/lib/explore-data";

type Filter = Sector | "All";

function FilterPill({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={[
        "rounded-full px-5 py-[7px] text-base font-bold transition-colors",
        active
          ? "bg-brand text-brand-foreground"
          : "border border-filter-line bg-surface-raised text-filter-text hover:border-brand hover:text-brand",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function HeroStock({
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
  const benchmark = benchmarkFor(stock);

  return (
    <section className="rounded-card border border-line bg-surface-raised p-8 shadow-card xl:p-[52px]">
      <div className="flex flex-wrap items-stretch gap-x-16 gap-y-10">
        <div className="flex min-w-[320px] flex-1 flex-col">
          {/* When nothing in the filtered set is ahead, the slot still has a
              leader — it is just the smallest lag, and it says so. */}
          <p className="text-base font-bold text-brand">
            {vsDirection === "up" ? "BIGGEST MARKET-BEATER TODAY" : "CLOSEST TO ITS MARKET TODAY"}
          </p>

          <div className="mt-8 flex items-center gap-8">
            <LogoTile
              stock={stock}
              size={91}
              className="rounded-logo-lg bg-ink-strong"
            />
            <div className="min-w-0">
              <h2 className="text-title-sm font-bold text-black">{stock.ticker}</h2>
              <p className="font-data text-xl font-light text-text-muted">{stock.name}</p>
            </div>
          </div>

          <p className="mt-10 flex flex-wrap items-baseline gap-4">
            <span className="font-data text-display font-semibold text-black">
              {formatPrice(stock.price)}
            </span>
            <span className="font-data text-xl font-light text-text-muted">
              {stock.currency}
            </span>
            <span
              className={[
                "flex items-center gap-2 font-data text-xl font-semibold",
                dayDirection === "up" ? "text-up" : "text-down",
              ].join(" ")}
            >
              <MoveCaret direction={dayDirection} />
              {formatPctBare(stock.changePct)}
            </span>
          </p>

          <div className="mt-auto border-t border-line-avatar pt-6">
            <p className="text-base font-bold text-brand">vs {benchmark}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-6">
              <span
                className={[
                  "font-data text-title-sm font-bold tracking-tight",
                  vsDirection === "up" ? "text-up" : "text-down",
                ].join(" ")}
              >
                {formatPct(stock.vsBenchmarkPct)}
              </span>

              {added ? (
                <AddToWatchlist ticker={stock.ticker} added onToggle={onToggle} />
              ) : (
                <button
                  type="button"
                  onClick={onToggle}
                  className="rounded-full border-2 border-brand-tint bg-brand px-[22px] py-3 font-data text-xl font-semibold text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-[320px] flex-[1.4]">
          <ExploreHeroChart
            label={`${stock.ticker} against the ${benchmark} today`}
            direction={vsDirection}
          />
        </div>
      </div>
    </section>
  );
}

export function ExploreView({ watchlistTickers }: { watchlistTickers: string[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [added, setAdded] = useState<string[]>(watchlistTickers);

  const stocks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return exploreUniverse
      .filter((stock) => filter === "All" || stock.sector === filter)
      .filter(
        (stock) =>
          needle === "" ||
          stock.ticker.toLowerCase().includes(needle) ||
          stock.name.toLowerCase().includes(needle),
      );
  }, [filter, query]);

  const hero = biggestMarketBeater(stocks);
  const beating = stocks.filter((stock) => stock.vsBenchmarkPct > 0).length;
  const sectors = showMore ? [...primarySectors, ...moreSectors] : primarySectors;

  function toggle(ticker: string) {
    setAdded((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker],
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="text-title font-bold text-ink">Explore</h1>

        <label className="relative block w-[335px] max-w-full">
          <span className="sr-only">Search a ticker or company</span>
          <svg
            viewBox="0 0 20 20"
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-6 size-[20px] -translate-y-1/2 text-text-faint"
          >
            <path
              d="M19.7192 18.3139L16.0114 14.6333C17.4506 12.8374 18.1476 10.5579 17.959 8.26356C17.7705 5.96919 16.7106 3.83432 14.9975 2.29792C13.2844 0.761532 11.0481 -0.0595993 8.74862 0.00337152C6.4491 0.0663423 4.26109 1.00863 2.63448 2.63648C1.00786 4.26433 0.066292 6.454 0.00336896 8.75527C-0.059554 11.0565 0.760954 13.2945 2.29618 15.0089C3.83141 16.7233 5.96466 17.784 8.25729 17.9727C10.5499 18.1614 12.8277 17.4639 14.6222 16.0235L18.3 19.7042C18.3929 19.7979 18.5035 19.8723 18.6253 19.9231C18.747 19.9739 18.8777 20 19.0096 20C19.1415 20 19.2722 19.9739 19.3939 19.9231C19.5157 19.8723 19.6263 19.7979 19.7192 19.7042C19.8993 19.5177 20 19.2684 20 19.009C20 18.7497 19.8993 18.5004 19.7192 18.3139ZM9.01554 16.0235C7.63189 16.0235 6.27932 15.6129 5.12886 14.8436C3.9784 14.0743 3.08172 12.9809 2.55223 11.7016C2.02273 10.4223 1.88419 9.01462 2.15412 7.65653C2.42406 6.29844 3.09035 5.05095 4.06873 4.07183C5.04712 3.0927 6.29366 2.4259 7.65072 2.15576C9.00778 1.88562 10.4144 2.02426 11.6927 2.55417C12.9711 3.08407 14.0637 3.98142 14.8324 5.13276C15.6011 6.28409 16.0114 7.63769 16.0114 9.02239C16.0114 10.8792 15.2743 12.66 13.9623 13.973C12.6504 15.2859 10.871 16.0235 9.01554 16.0235Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a ticker or company..."
            className="h-[50px] w-full rounded-full border border-line-avatar bg-surface-raised pr-6 pl-[58px] font-data text-sm font-light text-ink placeholder:text-text-faint focus-visible:border-brand focus-visible:outline-none"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3" role="group" aria-label="Sector">
        <FilterPill label="All" active={filter === "All"} onSelect={() => setFilter("All")} />
        {sectors.map((sector) => (
          <FilterPill
            key={sector}
            label={sector}
            active={filter === sector}
            onSelect={() => setFilter(sector)}
          />
        ))}

        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          aria-expanded={showMore}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-filter-hint-line px-[15px] py-[7px] text-base font-bold text-filter-hint transition-colors hover:border-brand hover:text-brand"
        >
          <svg viewBox="0 0 17 4" aria-hidden className="block h-[4px] w-[17px]">
            <path
              d="M8.5 0C8.12641 0 7.76122 0.117298 7.45059 0.337061C7.13996 0.556824 6.89786 0.869181 6.75489 1.23463C6.61193 1.60009 6.57452 2.00222 6.64741 2.39018C6.72029 2.77814 6.90019 3.13451 7.16435 3.41421C7.42852 3.69392 7.76509 3.8844 8.1315 3.96157C8.49791 4.03874 8.8777 3.99913 9.22285 3.84776C9.568 3.69638 9.863 3.44004 10.0706 3.11114C10.2781 2.78224 10.3889 2.39556 10.3889 2C10.3889 1.46957 10.1899 0.960859 9.83565 0.585787C9.48141 0.210714 9.00097 0 8.5 0ZM1.88889 0C1.5153 0 1.15011 0.117298 0.839479 0.337061C0.528853 0.556824 0.286749 0.869181 0.143784 1.23463C0.000818421 1.60009 -0.0365879 2.00222 0.0362953 2.39018C0.109179 2.77814 0.289078 3.13451 0.553243 3.41421C0.817409 3.69392 1.15398 3.8844 1.52039 3.96157C1.88679 4.03874 2.26659 3.99913 2.61174 3.84776C2.95689 3.69638 3.25189 3.44004 3.45944 3.11114C3.667 2.78224 3.77778 2.39556 3.77778 2C3.77778 1.46957 3.57877 0.960859 3.22454 0.585787C2.8703 0.210714 2.38985 0 1.88889 0ZM15.1111 0C14.7375 0 14.3723 0.117298 14.0617 0.337061C13.7511 0.556824 13.509 0.869181 13.366 1.23463C13.223 1.60009 13.1856 2.00222 13.2585 2.39018C13.3314 2.77814 13.5113 3.13451 13.7755 3.41421C14.0396 3.69392 14.3762 3.8844 14.7426 3.96157C15.109 4.03874 15.4888 3.99913 15.834 3.84776C16.1791 3.69638 16.4741 3.44004 16.6817 3.11114C16.8892 2.78224 17 2.39556 17 2C17 1.46957 16.801 0.960859 16.4468 0.585787C16.0925 0.210714 15.6121 0 15.1111 0Z"
              fill="currentColor"
            />
          </svg>
          {showMore ? "Less" : "More"}
        </button>
      </div>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
        <p className="flex flex-wrap items-baseline gap-4">
          <span className="text-2xl font-bold text-black">
            {filter === "All" ? "All sectors" : filter}
          </span>
          <span className="text-base text-text-muted">measured against the market</span>
        </p>

        <p className="flex items-baseline gap-2">
          <span className="font-data text-2xl font-bold text-up">{beating}</span>
          <span className="font-data text-sm text-text-ticker">
            of {stocks.length} beating their market
          </span>
        </p>
      </div>

      {hero && (
        <div className="mt-10">
          <HeroStock
            stock={hero}
            added={added.includes(hero.ticker)}
            onToggle={() => toggle(hero.ticker)}
          />
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stocks.map((stock) => (
          <ExploreCard
            key={stock.ticker}
            stock={stock}
            added={added.includes(stock.ticker)}
            onToggle={() => toggle(stock.ticker)}
          />
        ))}
      </div>

      {stocks.length === 0 && (
        <p className="mt-16 text-center text-xl text-text-faint">
          Nothing here matches “{query.trim()}”.
        </p>
      )}
    </>
  );
}
