import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPct, formatPrice } from "@/lib/format";
import type { DirectoryStock, StockQuote } from "@/lib/search-ranking";
import { StockLogo } from "./stock-logo";
import styles from "./stock-row.module.css";

/** One stock in the search dropdown or a sector list: logo, ticker, name, price, day move. */
export function StockRow({ stock, quote }: { stock: DirectoryStock; quote: StockQuote | null | undefined }) {
  const changePct = quote?.changePct ?? null;
  const Arrow = (changePct ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;
  return <>
    <StockLogo stock={{ ticker: stock.symbol }} remoteSrc={quote?.logoUrl} />
    <span className={styles.identity}>
      <strong>{stock.symbol}</strong>
      <small title={stock.name}>{stock.name}</small>
    </span>
    {stock.exchange && <span className={styles.exchange}>{stock.exchange}</span>}
    <span className={styles.quote}>
      {quote === undefined
        ? <span className={styles.loading} aria-label="Loading price" />
        : quote?.price == null
          ? <span className={styles.unavailable} title="No price yet. Open the stock to load it.">—<span className="sr-only">No price yet</span></span>
          : <span className={styles.price}>{quote.currency === "USD" ? "$" : `${quote.currency} `}{formatPrice(quote.price)}</span>}
      {changePct !== null && <span className={changePct >= 0 ? styles.up : styles.down}><Arrow size={12} aria-hidden="true" />{formatPct(changePct)}</span>}
    </span>
  </>;
}
