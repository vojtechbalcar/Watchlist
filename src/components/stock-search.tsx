"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { formatPct, formatPrice } from "@/lib/format";
import type { SearchResult } from "@/lib/search-ranking";
import { StockLogo } from "./stock-logo";
import styles from "./stock-search.module.css";

const DEBOUNCE_MS = 250;

type Answer = { query: string; results: SearchResult[]; failed: boolean };

/**
 * Searches every NASDAQ and NYSE stock through /api/search and lists matches
 * under the field. Tracked stocks link to their detail page; others show
 * their price only, fetched when searched.
 */
export function StockSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [answer, setAnswer] = useState<Answer>({ query: "", results: [], failed: false });

  const trimmed = query.trim();
  const settled = answer.query === trimmed;
  const results = settled ? answer.results : [];

  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then(response => (response.ok ? response.json() : Promise.reject(new Error(`Search answered ${response.status}`))))
        .then((data: { results: SearchResult[] }) => setAnswer({ query: trimmed, results: data.results, failed: false }))
        .catch(() => {
          if (!controller.signal.aborted) setAnswer({ query: trimmed, results: [], failed: true });
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

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
    } else if (event.key === "Enter" && results[active]?.tracked) {
      event.preventDefault();
      setOpen(false);
      router.push(`/explore/stocks/${results[active].ticker}`);
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
          <ul id={listId} role="listbox" aria-label="Matching stocks" aria-busy={!settled}>
            {results.map((stock, index) => (
              <li key={stock.ticker} id={optionId(index)} role="option" aria-selected={index === active} className={styles.option} onPointerEnter={() => setActive(index)}>
                {stock.tracked
                  ? <Link href={`/explore/stocks/${stock.ticker}`} className={styles.row} tabIndex={-1} onClick={() => setOpen(false)}><Row stock={stock} /></Link>
                  : <div className={styles.row}><Row stock={stock} /></div>}
              </li>
            ))}
          </ul>
          {!settled && results.length === 0 && <p className={styles.message} role="status">Searching…</p>}
          {settled && answer.failed && <p className={styles.message} role="status">Search isn’t available right now. Try again in a moment.</p>}
          {settled && !answer.failed && results.length === 0 && <p className={styles.message} role="status">No US stocks match “{trimmed}”.</p>}
        </div>
      )}
    </div>
  );
}

function Row({ stock }: { stock: SearchResult }) {
  const Arrow = (stock.changePct ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;
  return <>
    <StockLogo stock={stock} remoteSrc={stock.logoUrl} />
    <span className={styles.identity}>
      <strong>{stock.ticker}</strong>
      <small title={stock.name}>{stock.name}</small>
    </span>
    {!stock.tracked && stock.exchange && <span className={styles.exchange}>{stock.exchange}</span>}
    <span className={styles.quote}>
      {stock.price === null
        ? <span className={styles.unavailable} title="Price unavailable right now">—<span className="sr-only">Price unavailable right now</span></span>
        : <span className={styles.price}>{stock.currency === "USD" ? "$" : `${stock.currency} `}{formatPrice(stock.price)}</span>}
      {stock.changePct !== null && (
        <span className={stock.changePct >= 0 ? styles.up : styles.down}><Arrow size={12} aria-hidden="true" />{formatPct(stock.changePct)}</span>
      )}
    </span>
  </>;
}
