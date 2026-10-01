import { SiteHeader } from "@/components/site-header";
import { MarketBarSkeleton, OverviewCardSkeleton, PageHeadingSkeleton, WatchlistTableSkeleton } from "@/components/skeletons";

export default function DashboardLoading() {
  return <>
    <SiteHeader active="Dashboard" />
    <MarketBarSkeleton />
    <main className="page-shell">
      <PageHeadingSkeleton />
      <OverviewCardSkeleton />
      <div className="mt-10"><WatchlistTableSkeleton compact /></div>
    </main>
  </>;
}
