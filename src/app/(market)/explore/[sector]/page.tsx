import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ExploreView } from "@/components/explore-view";
import { ExploreViewSkeleton } from "@/components/skeletons";
import { sectorDescriptions, sectorFromSlug, sectors, sectorSlug } from "@/lib/explore-data";

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
        <Suspense fallback={<ExploreViewSkeleton />}><ExploreView key={category} category={category} /></Suspense>
      </main>
    </>
  );
}
