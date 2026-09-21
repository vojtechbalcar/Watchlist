import { SiteHeader } from "@/components/site-header";
import { ExploreViewSkeleton } from "@/components/skeletons";

export default function SectorLoading() {
  return <>
    <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <main className="page-shell"><div><ExploreViewSkeleton /></div></main>
  </>;
}
