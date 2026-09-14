import { WatchlistTable } from "@/components/watchlist-table";
import { holdings, overview, watchlistSummary } from "@/lib/watchlist-data";

export const metadata = {
  title: "Watchlist",
};

export default function WatchlistPage() {
  return (
    <>

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
