import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { WatchlistWorkspace } from "@/components/watchlist-workspace";
import { WatchlistTableSkeleton } from "@/components/skeletons";

export const metadata = {
  title: "Watchlist",
};

export default function WatchlistPage() {
  return (
    <>
      <SiteHeader active="Watchlist" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="page-shell">
        <Suspense fallback={<WatchlistTableSkeleton />}><WatchlistWorkspace /></Suspense>
      </main>
    </>
  );
}
