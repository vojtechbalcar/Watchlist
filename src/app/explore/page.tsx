import { SiteHeader } from "@/components/site-header";
import { ExploreView } from "@/components/explore-view";
import { holdings } from "@/lib/watchlist-data";

export const metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return (
    <>
      <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="mx-auto w-full max-w-(--container-page) px-6 pb-24 sm:px-8">
        <div className="mt-14">
          {/* What is already on the watchlist decides which cards show a check. */}
          <ExploreView watchlistTickers={holdings.map((holding) => holding.ticker)} />
        </div>
      </main>
    </>
  );
}
