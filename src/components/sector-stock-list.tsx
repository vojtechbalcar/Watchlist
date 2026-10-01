"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStockDirectory, useStockQuotes } from "./stock-directory-client";
import { StockRow } from "./stock-row";
import styles from "./sector-stock-list.module.css";

const PAGE = 30;

/**
 * Every NASDAQ/NYSE stock in a sector, below the sector's tracked cards.
 * Sectors outside the tracked set come from SEC industry codes. Prices are
 * only what is stored: a stock someone has searched or opened has one,
 * the rest show a gap until they are opened.
 */
export function SectorStockList({ sector }: { sector: string }) {
  const { stocks, failed } = useStockDirectory();
  const [shown, setShown] = useState(PAGE);
  const inSector = useMemo(() => (stocks ?? []).filter(stock => stock.sector === sector), [stocks, sector]);
  const visible = inSector.slice(0, shown);
  const quoteOf = useStockQuotes(visible.map(stock => stock.symbol), false);

  return (
    <section className={styles.section} aria-labelledby="sector-all-heading">
      <div className={styles.heading}>
        <h2 id="sector-all-heading">Every {sector.toLowerCase()} stock</h2>
        <span>{stocks ? `${inSector.length.toLocaleString("en-US")} on NASDAQ and NYSE` : ""}</span>
      </div>
      <p className={styles.note}>Prices show for stocks someone has looked up recently. Open any stock to load its price.</p>

      {!stocks && !failed && <p className={styles.note} role="status">Loading stocks…</p>}
      {failed && <p className={styles.note} role="status">The full list isn’t available right now. Reload the page to try again.</p>}

      <ul className={styles.list}>
        {visible.map(stock => (
          <li key={stock.symbol}><Link href={`/explore/stocks/${encodeURIComponent(stock.symbol)}`} prefetch={false} className={styles.row}><StockRow stock={stock} quote={quoteOf(stock.symbol)} /></Link></li>
        ))}
      </ul>
      {shown < inSector.length && (
        <button type="button" className={styles.more} onClick={() => setShown(count => count + PAGE)}>
          Show {Math.min(PAGE, inSector.length - shown)} more <span>· {visible.length} of {inSector.length.toLocaleString("en-US")}</span>
        </button>
      )}
    </section>
  );
}
