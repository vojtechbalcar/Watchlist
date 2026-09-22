import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { MarketBar } from "@/components/market-bar";
import { WatchlistWorkspace } from "@/components/watchlist-workspace";
import { MarketBarSkeleton, WatchlistTableSkeleton } from "@/components/skeletons";
import { marketIndices } from "@/lib/watchlist-data";

export default function DashboardPage() {
  return <>
    <SiteHeader active="Dashboard" asOf="Aug 25 · 15:58 ET" initials="JR" />
    {/* Boundaries shaped for the Postgres reads that replace the demo snapshot. */}
    <Suspense fallback={<MarketBarSkeleton />}><MarketBar indices={marketIndices} /></Suspense>
    <main className="page-shell">
      <Suspense fallback={<WatchlistTableSkeleton compact />}><WatchlistWorkspace dashboard /></Suspense>
    </main>
  </>;
}
