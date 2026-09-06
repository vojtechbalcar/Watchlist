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

      <main className="page-shell">
        <div>
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
