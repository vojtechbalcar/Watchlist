import { SiteHeader } from "@/components/site-header";
import { WatchlistTableSkeleton } from "@/components/skeletons";

export default function WatchlistLoading() {
  return <>
    <SiteHeader active="Watchlist" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <main className="page-shell"><WatchlistTableSkeleton /></main>
  </>;
}
