import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { StockDetail } from "@/components/stock-detail";
import { exploreUniverse } from "@/lib/explore-data";

type Props = { params: Promise<{ ticker: string }> };

function findStock(ticker: string) {
  const stock = exploreUniverse.find(stock => stock.ticker === ticker.toUpperCase());
  if (!stock) notFound();
  return stock;
}

export function generateStaticParams() {
  return exploreUniverse.map(({ ticker }) => ({ ticker }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stock = findStock((await params).ticker);
  return { title: `${stock.ticker} · ${stock.name}`, description: `Compare ${stock.name} with its sector benchmark across daily, weekly, monthly, and annual returns.` };
}

export default async function StockPage({ params }: Props) {
  const stock = findStock((await params).ticker);
  return <>
    <SiteHeader active="Explore" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <main className="page-shell"><StockDetail stock={stock} /></main>
  </>;
}
