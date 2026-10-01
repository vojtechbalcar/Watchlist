import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPct, formatPrice } from "@/lib/format";
import type { ListingDetail } from "@/lib/listing-detail";
import { StockLogo } from "./stock-logo";
import styles from "./stock-detail.module.css";

function direction(value: number) {
  return value > 0 ? "text-up" : value < 0 ? "text-down" : "text-text-secondary";
}

function gapLabel(value: number) {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}`;
}

const updatedFormat = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/**
 * The page for a stock outside the tracked set, reached from search. It has
 * the tracked page's comparison table, against the S&P 500 because these
 * stocks have no sector benchmark, but no chart or watchlist button yet.
 */
export function ListingDetailView({ stock }: { stock: ListingDetail }) {
  const currency = stock.currency === "USD" ? "$" : `${stock.currency} `;
  const hasReturns = stock.returns.some(row => row.stock !== null);

  return <>
    <nav aria-label="Stock navigation" className={styles.breadcrumb}>
      <Link href="/explore"><ArrowLeft size={14} aria-hidden="true" /> Explore</Link><span aria-hidden="true">/</span><span>{stock.ticker}</span>
    </nav>
    <header className={styles.heading}>
      <div className={styles.identity}><StockLogo stock={stock} remoteSrc={stock.logoUrl} /><div><p className="eyebrow">{stock.exchange} · {stock.ticker}</p><h1>{stock.name}</h1></div></div>
    </header>

    <div className={styles.quote}>
      {stock.price === null
        ? <><strong>—</strong><span>Price unavailable right now. Try again in a minute.</span></>
        : <><strong>{currency}{formatPrice(stock.price)}</strong>
          {stock.changePct !== null && <span className={direction(stock.changePct)}>{formatPct(stock.changePct)}</span>}
          <span>today · {stock.currency}{stock.priceFetchedAt && ` · updated ${updatedFormat.format(stock.priceFetchedAt)} ET`}</span></>}
    </div>

    <section className={styles.periods} aria-labelledby="period-performance-heading">
      <div className="section-heading"><h2 id="period-performance-heading">Against the market</h2><span>{stock.ticker} compared with the {stock.benchmark}{stock.closesThrough && `, to the close of ${stock.closesThrough}`}</span></div>
      <div className={styles.tableScroll}><table className={styles.table}>
        <caption className="sr-only">{stock.ticker} returns compared with the {stock.benchmark}; differences in percentage points.</caption>
        <thead><tr><th scope="col">Period</th><th scope="col">{stock.ticker}</th><th scope="col">{stock.benchmark}</th><th scope="col">Difference</th><th scope="col">Against the market</th></tr></thead>
        <tbody>{stock.returns.map(row => (
          <tr key={row.period}><th scope="row">{row.period}</th>
            <td>{row.stock === null ? "—" : formatPct(row.stock)}</td>
            <td>{row.benchmark === null ? "—" : formatPct(row.benchmark)}</td>
            <td className={row.gap === null ? undefined : direction(row.gap)}>{row.gap === null ? "—" : `${gapLabel(row.gap)} pp`}</td>
            <td className={row.gap === null ? undefined : direction(row.gap)}>{row.gap === null ? "Unavailable" : row.gap > 0 ? "Ahead" : row.gap < 0 ? "Behind" : "In line"}</td>
          </tr>
        ))}</tbody>
      </table></div>
      {!hasReturns && <p className={styles.message}>Returns appear once this stock’s price history has loaded. Try again in a minute.</p>}
    </section>
  </>;
}
