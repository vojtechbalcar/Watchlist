import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StockLogo } from "./stock-logo";

/** A real link keeps company cells accessible and supports opening a new tab. */
export function StockLink({ stock }: { stock: { ticker: string; name: string } }) {
  return <Link href={`/explore/stocks/${stock.ticker}`} className="stock-company stock-detail-link" aria-label={`View ${stock.name} (${stock.ticker}) details`}>
    <StockLogo stock={stock} />
    <span className="stock-link-name"><strong>{stock.ticker}</strong><small>{stock.name}</small></span>
    <ArrowUpRight className="stock-link-arrow" size={14} aria-hidden="true" />
  </Link>;
}
