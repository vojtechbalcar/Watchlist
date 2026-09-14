import Link from "next/link";
import { MarketBar } from "@/components/market-bar";
import { OverviewCard } from "@/components/overview-card";
import { WatchlistTable } from "@/components/watchlist-table";
import { marketIndices, overview, holdings } from "@/lib/watchlist-data";

export default function DashboardPage() {
  return <>
    <MarketBar indices={marketIndices} />
    <main className="page-shell">
      <div className="page-heading"><div><p className="eyebrow">Your market at a glance</p><h1 className="page-title">Overview</h1></div><div className="page-actions"><Link href="/compare">Compare stocks &nbsp; ↗</Link><Link href="/explore" className="primary-action">＋ Add stocks</Link></div></div>
      <OverviewCard summary={overview} />
      <div className="mt-10"><WatchlistTable holdings={holdings} benchmarkLabel={overview.benchmarkLabel} compact /></div>
    </main>
  </>;
}
