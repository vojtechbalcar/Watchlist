import { SiteHeader } from "@/components/site-header";
import { WatchlistTableSkeleton } from "@/components/skeletons";

export default function WatchlistLoading() {
  return <>
    <SiteHeader active="Watchlist" />
    <main className="page-shell"><WatchlistTableSkeleton /></main>
  </>;
}
