import { ExploreView } from "@/components/explore-view";
import { holdings } from "@/lib/watchlist-data";

export const metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return (
    <>

      <main className="page-shell">
        <div>
          {/* What is already on the watchlist decides which cards show a check. */}
          <ExploreView watchlistTickers={holdings.map((holding) => holding.ticker)} />
        </div>
      </main>
    </>
  );
}
