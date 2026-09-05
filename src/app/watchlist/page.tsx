import { SiteHeader } from "@/components/site-header";
import { WatchlistTable } from "@/components/watchlist-table";
import { holdings, overview, watchlistSummary } from "@/lib/watchlist-data";

export const metadata = {
  title: "Watchlist",
};

export default function WatchlistPage() {
  return (
    <>
      <SiteHeader active="Watchlist" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="mx-auto w-full max-w-(--container-page) px-6 pb-24 sm:px-8">
        <div className="mt-24">
          <WatchlistTable
            holdings={holdings}
            summary={watchlistSummary}
            benchmarkLabel={overview.benchmarkLabel}
          />
        </div>
      </main>
    </>
  );
}
