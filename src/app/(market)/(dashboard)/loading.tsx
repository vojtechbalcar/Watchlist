import { SiteHeader } from "@/components/site-header";
import { MarketBarSkeleton, OverviewCardSkeleton, PageHeadingSkeleton, WatchlistTableSkeleton } from "@/components/skeletons";

export default function DashboardLoading() {
  return <>
    <SiteHeader active="Dashboard" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <MarketBarSkeleton />
    <main className="page-shell">
      <PageHeadingSkeleton />
      <OverviewCardSkeleton />
      <div className="mt-10"><WatchlistTableSkeleton compact /></div>
    </main>
  </>;
}
