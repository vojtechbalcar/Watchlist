import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SiteHeader } from "@/components/site-header";
import { StockDetail } from "@/components/stock-detail";
import { ListingDetailView } from "@/components/listing-detail-view";
import { getDb } from "@/lib/db";
import { exploreUniverse } from "@/lib/explore-data";
import { getListingDetail } from "@/lib/listing-detail";

type Props = { params: Promise<{ ticker: string }> };

function trackedStock(ticker: string) {
  return exploreUniverse.find(stock => stock.ticker === ticker.toUpperCase());
}

/** Any other NASDAQ/NYSE stock search can find. Shared by metadata and the page. */
const listedStock = cache((ticker: string) => getListingDetail(getDb(), decodeURIComponent(ticker).toUpperCase()));

export function generateStaticParams() {
  return exploreUniverse.map(({ ticker }) => ({ ticker }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const stock = trackedStock(ticker) ?? (await listedStock(ticker));
  if (!stock) notFound();
  return { title: `${stock.ticker} · ${stock.name}`, description: `Compare ${stock.name} with the market across daily, weekly, monthly, and annual returns.` };
}

export default async function StockPage({ params }: Props) {
  const { ticker } = await params;
  const tracked = trackedStock(ticker);
  const listed = tracked ? null : await listedStock(ticker);
  if (!tracked && !listed) notFound();
  return <>
    <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" />
    <main className="page-shell">{tracked ? <StockDetail stock={tracked} /> : <ListingDetailView stock={listed!} />}</main>
  </>;
}
