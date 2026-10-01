import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { MarketBar } from "@/components/market-bar";
import { WatchlistWorkspace } from "@/components/watchlist-workspace";
import { MarketBarSkeleton, WatchlistTableSkeleton } from "@/components/skeletons";

export default function DashboardPage() {
  return <>
    <SiteHeader active="Dashboard" />
    <Suspense fallback={<MarketBarSkeleton />}><MarketBar /></Suspense>
    <main className="page-shell">
      <Suspense fallback={<WatchlistTableSkeleton compact />}><WatchlistWorkspace dashboard /></Suspense>
    </main>
  </>;
}
