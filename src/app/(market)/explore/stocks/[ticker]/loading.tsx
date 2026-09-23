import { SiteHeader } from "@/components/site-header";
import { LoadingStatus, OverviewCardSkeleton, PageHeadingSkeleton } from "@/components/skeletons";

export default function StockLoading() {
  return <>
    <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <main className="page-shell"><LoadingStatus>Loading stock details…</LoadingStatus><PageHeadingSkeleton actions={1} /><OverviewCardSkeleton /></main>
  </>;
}
