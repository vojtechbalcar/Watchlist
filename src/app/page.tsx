import { SiteHeader } from "@/components/site-header";
import { MarketBar } from "@/components/market-bar";
import { OverviewCard } from "@/components/overview-card";
import { StockCard } from "@/components/stock-card";
import { marketIndices, overview, holdings } from "@/lib/watchlist-data";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader active="Dashboard" asOf="Aug 25 · 15:58 ET" initials="JR" />
      <MarketBar indices={marketIndices} />

      <main className="mx-auto w-full max-w-(--container-page) px-6 pb-24 sm:px-8">
        <h1 className="mt-14 text-title font-bold text-ink">Overview</h1>

        <div className="mt-8">
          <OverviewCard summary={overview} />
        </div>

        <div className="mt-20 flex items-baseline gap-4">
          <h2 className="text-title-sm font-bold text-ink">Watchlist</h2>
          <p className="text-xl font-bold text-text-faint">
            {holdings.length} holdings
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {holdings.map((holding) => (
            <StockCard
              key={holding.ticker}
              holding={holding}
              benchmarkLabel={overview.benchmarkLabel}
            />
          ))}
        </div>
      </main>
    </>
  );
}
