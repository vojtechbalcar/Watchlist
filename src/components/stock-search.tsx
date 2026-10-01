"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { normalizeQuery, rankCandidates } from "@/lib/search-ranking";
import { useStockDirectory, useStockQuotes } from "./stock-directory-client";
import { StockRow } from "./stock-row";
import styles from "./stock-search.module.css";

/** Prices are asked for once typing pauses; matches themselves appear on every keystroke. */
const QUOTE_DELAY_MS = 200;

const stockHref = (ticker: string) => `/explore/stocks/${encodeURIComponent(ticker)}`;

/**
 * Searches every NASDAQ and NYSE stock. The whole list is loaded once and
 * matched in the browser, so results appear as you type; only the prices of
 * the visible matches come from the server. Each result opens its stock page.
 */
export function StockSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const { stocks, failed } = useStockDirectory();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const trimmed = normalizeQuery(query);
  const results = useMemo(() => (trimmed && stocks ? rankCandidates(trimmed, stocks) : []), [trimmed, stocks]);
  const quoteOf = useStockQuotes(results.map(stock => stock.symbol), true, QUOTE_DELAY_MS);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const expanded = open && trimmed !== "";
  const optionId = (index: number) => `${listId}-option-${index}`;

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (expanded) setOpen(false);
      else setQuery("");
      return;
    }
    if (!expanded || results.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(current => (current + step + results.length) % results.length);
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      setOpen(false);
      router.push(stockHref(results[active].symbol));
    }
  }

  return (
    <div ref={root} className={styles.root}>
      <label className={className}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          role="combobox"
          aria-label="Search stocks"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 && active < results.length ? optionId(active) : undefined}
          placeholder="Search any US stock by name or ticker"
          autoComplete="off"
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </label>

      {expanded && (
        <div className={styles.panel}>
          <ul id={listId} role="listbox" aria-label="Matching stocks" aria-busy={!stocks && !failed}>
            {results.map((stock, index) => (
              <li key={stock.symbol} id={optionId(index)} role="option" aria-selected={index === active} className={styles.option} onPointerEnter={() => setActive(index)}>
                <Link href={stockHref(stock.symbol)} prefetch={false} className={styles.row} tabIndex={-1} onClick={() => setOpen(false)}><StockRow stock={stock} quote={quoteOf(stock.symbol)} /></Link>
              </li>
            ))}
          </ul>
          {!stocks && !failed && <p className={styles.message} role="status">Loading stocks…</p>}
          {failed && <p className={styles.message} role="status">Search isn’t available right now. Reload the page to try again.</p>}
          {stocks && results.length === 0 && <p className={styles.message} role="status">No US stocks match “{trimmed}”.</p>}
        </div>
      )}
    </div>
  );
}
