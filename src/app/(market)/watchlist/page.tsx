import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { WatchlistWorkspace } from "@/components/watchlist-workspace";
import { WatchlistTableSkeleton } from "@/components/skeletons";

export const metadata = {
  title: "Watchlist",
};

export default async function WatchlistPage({ searchParams }: PageProps<"/watchlist">) {
  const { setup } = await searchParams;
  return (
    <>
      <SiteHeader active="Watchlist" />

      <main className="page-shell">
        <Suspense fallback={<WatchlistTableSkeleton />}><WatchlistWorkspace continueSetup={setup === "continue"} /></Suspense>
      </main>
    </>
  );
}
