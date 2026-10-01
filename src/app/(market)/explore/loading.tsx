import { SiteHeader } from "@/components/site-header";
import { ExploreViewSkeleton } from "@/components/skeletons";

export default function ExploreLoading() {
  return <>
    <SiteHeader active="Explore" />
    <main className="page-shell"><div><ExploreViewSkeleton /></div></main>
  </>;
}
