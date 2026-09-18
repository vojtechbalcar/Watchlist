import { SiteHeader } from "@/components/site-header";
import { ExploreView } from "@/components/explore-view";

export const metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return (
    <>
      <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="page-shell">
        <div>
          <ExploreView />
        </div>
      </main>
    </>
  );
}
