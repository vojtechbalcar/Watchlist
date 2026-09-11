import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ExploreView } from "@/components/explore-view";
import { sectorDescriptions, sectorFromSlug, sectors, sectorSlug } from "@/lib/explore-data";
import { holdings } from "@/lib/watchlist-data";

type Props = { params: Promise<{ sector: string }> };

export function generateStaticParams() {
  return sectors.map(sector => ({ sector: sectorSlug(sector) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = sectorFromSlug((await params).sector);
  if (!category) notFound();
  return { title: `${category} stocks`, description: sectorDescriptions[category] };
}

export default async function SectorPage({ params }: Props) {
  const category = sectorFromSlug((await params).sector);
  if (!category) notFound();

  return (
    <>
      <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" initials="JR" />
      <main className="page-shell">
        <ExploreView key={category} category={category} watchlistTickers={holdings.map(holding => holding.ticker)} />
      </main>
    </>
  );
}
