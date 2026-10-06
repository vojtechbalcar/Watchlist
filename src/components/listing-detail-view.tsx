import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPct, formatPrice } from "@/lib/format";
import type { ListingDetail } from "@/lib/listing-detail";
import { ListingPerformance } from "./listing-performance";
import { StockLogo } from "./stock-logo";
import { WatchlistToggle } from "./watchlist-toggle";
import styles from "./stock-detail.module.css";

function direction(value: number) {
  return value > 0 ? "text-up" : value < 0 ? "text-down" : "text-text-secondary";
}

const updatedFormat = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/**
 * The page for a stock outside the tracked set, reached from search. It has
 * the tracked page's chart and comparison table, against the S&P 500 because
 * these stocks have no sector benchmark.
 */
export function ListingDetailView({ stock }: { stock: ListingDetail }) {
  const currency = stock.currency === "USD" ? "$" : `${stock.currency} `;

  return <>
    <nav aria-label="Stock navigation" className={styles.breadcrumb}>
      <Link href="/explore"><ArrowLeft size={14} aria-hidden="true" /> Explore</Link><span aria-hidden="true">/</span><span>{stock.ticker}</span>
    </nav>
    <header className={styles.heading}>
      <div className={styles.identity}><StockLogo stock={stock} remoteSrc={stock.logoUrl} /><div><p className="eyebrow">{stock.exchange} · {stock.ticker}</p><h1>{stock.name}</h1></div></div>
      <WatchlistToggle ticker={stock.ticker} />
    </header>

    <div className={styles.quote}>
      {stock.price === null
        ? <><strong>—</strong><span>Price unavailable right now. Try again in a minute.</span></>
        : <><strong>{currency}{formatPrice(stock.price)}</strong>
          {stock.changePct !== null && <span className={direction(stock.changePct)}>{formatPct(stock.changePct)}</span>}
          <span>today · {stock.currency}{stock.priceFetchedAt && ` · updated ${updatedFormat.format(stock.priceFetchedAt)} ET`}</span></>}
    </div>

    <ListingPerformance stock={stock} />
  </>;
}
