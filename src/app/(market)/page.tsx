import { SiteHeader } from "@/components/site-header";
import { MarketBar } from "@/components/market-bar";
import { WatchlistWorkspace } from "@/components/watchlist-workspace";
import { marketIndices } from "@/lib/watchlist-data";

export default function DashboardPage() {
  return <>
    <SiteHeader active="Dashboard" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <MarketBar indices={marketIndices} />
    <main className="page-shell">
      <WatchlistWorkspace dashboard />
    </main>
  </>;
}
