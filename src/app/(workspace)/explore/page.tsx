import { SiteHeader } from "@/components/site-header";
import { ExploreView } from "@/components/explore-view";
import { holdings } from "@/lib/watchlist-data";

export const metadata = {
  title: "Explore | Watchlist",
};

export default function ExplorePage() {
  return (
    <>
      <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="page-shell">
        <div>
          {/* What is already on the watchlist decides which cards show a check. */}
          <ExploreView watchlistTickers={holdings.map((holding) => holding.ticker)} />
        </div>
      </main>
    </>
  );
}
