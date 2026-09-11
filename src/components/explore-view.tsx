"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { ExploreCard } from "./explore-card";
import {
  exploreUniverse,
  sectors,
  sectorBenchmarks,
  sectorDescriptions,
  sectorSlug,
  type Sector,
} from "@/lib/explore-data";
import styles from "./explore-view.module.css";

const PREVIEW_COUNT = 4;

export function ExploreView({
  watchlistTickers,
  category,
}: {
  watchlistTickers: string[];
  category?: Sector;
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(watchlistTickers);
  const [sort, setSort] = useState("default");

  const search = query.trim().toLowerCase();
  const stocks = exploreUniverse
    .filter(stock => !category || stock.sector === category)
    .filter(stock => `${stock.ticker} ${stock.name} ${stock.sector}`.toLowerCase().includes(search))
    .filter(stock => filter === "all" || (filter === "ahead" ? stock.vsBenchmarkPct > 0 : stock.vsBenchmarkPct <= 0));

  if (sort === "gap") stocks.sort((a, b) => b.vsBenchmarkPct - a.vsBenchmarkPct);
  if (sort === "price") stocks.sort((a, b) => b.price - a.price);
  if (sort === "day") stocks.sort((a, b) => b.changePct - a.changePct);
  if (sort === "company") stocks.sort((a, b) => a.ticker.localeCompare(b.ticker));

  const groups = sectors
    .map(sector => ({ sector, stocks: stocks.filter(stock => stock.sector === sector) }))
    .filter(group => group.stocks.length > 0);

  function toggleStock(ticker: string) {
    setAdded(previous => previous.includes(ticker) ? previous.filter(item => item !== ticker) : [...previous, ticker]);
  }

  function resetFilters() {
    setQuery("");
    setFilter("all");
  }

  function renderCard(stock: (typeof exploreUniverse)[number]) {
    return <ExploreCard key={stock.ticker} stock={stock} added={added.includes(stock.ticker)} onToggle={() => toggleStock(stock.ticker)} />;
  }

  return (
    <>
      {category && <Link href="/explore" className={styles.back}><ArrowLeft size={14} aria-hidden="true" /> All sectors</Link>}
      <div className={`page-heading ${styles.pageHeading}`}>
        <div>
          <p className="eyebrow">{category ? "Explore / " + category : "A wider view of the market"}</p>
          <h1 className="page-title">{category ?? "Explore"}</h1>
          <p className={styles.intro}>{category ? sectorDescriptions[category] : "Discover your next stock, one sector at a time."}</p>
        </div>
        <div className="page-actions">
          <Link href="/watchlist" className={styles.watchlistLink}>Your watchlist <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>

      <section aria-label={category ? `${category} stocks` : "Browse stocks by sector"}>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input type="search" aria-label="Search stocks" placeholder={category ? `Search ${category.toLowerCase()} stocks` : "Search companies, tickers, or sectors"} value={query} onChange={event => setQuery(event.target.value)} />
          </label>
          <div className={styles.filters}>
            <label className={styles.select}>
              <span>Performance</span>
              <select value={filter} onChange={event => setFilter(event.target.value)}>
                <option value="all">All stocks</option>
                <option value="ahead">Ahead of benchmark</option>
                <option value="behind">Behind benchmark</option>
              </select>
            </label>
            <label className={styles.select}>
              <span>Sort by</span>
              <select value={sort} onChange={event => setSort(event.target.value)}>
                <option value="default">Default order</option>
                <option value="company">Ticker A–Z</option>
                <option value="gap">Benchmark lead</option>
                <option value="day">Day change</option>
                <option value="price">Highest price</option>
              </select>
            </label>
          </div>
        </div>

        <div className={styles.results}>
          <p role="status">
            {stocks.length} {stocks.length === 1 ? "stock" : "stocks"}{!category && ` across ${groups.length} ${groups.length === 1 ? "sector" : "sectors"}`}
            {(search || filter !== "all") && <button type="button" onClick={resetFilters}>Clear filters</button>}
          </p>
          <span>Demo data <span aria-hidden="true">·</span> {category ? `vs. ${sectorBenchmarks[category]}` : "Daily snapshot"}</span>
        </div>

        {category ? (
          <div>
            <h2 className="sr-only">All {category} stocks</h2>
            <div className={styles.grid}>{stocks.map(renderCard)}</div>
          </div>
        ) : (
          <div className={styles.sectors}>
            {groups.map(({ sector, stocks: sectorStocks }, index) => (
              <section key={sector} className={styles.sector} aria-labelledby={`sector-${sectorSlug(sector)}`}>
                <div className={styles.sectorHeading}>
                  <div className={styles.sectorIdentity}>
                    <span className={styles.sectorNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h2 id={`sector-${sectorSlug(sector)}`}>{sector}<span>{sectorStocks.length} stocks</span></h2>
                      <p>{sectorDescriptions[sector]}</p>
                    </div>
                  </div>
                  <Link href={`/explore/${sectorSlug(sector)}`} className={styles.showAll} aria-label={`Show all ${sector} stocks`}>
                    Show all <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
                <div className={styles.grid}>{sectorStocks.slice(0, PREVIEW_COUNT).map(renderCard)}</div>
              </section>
            ))}
          </div>
        )}

        {stocks.length === 0 && (
          <div className={styles.empty}>
            <h2>No stocks found</h2>
            <p>Try another company or ticker, or clear your filters.</p>
            <button type="button" onClick={resetFilters}>Clear filters</button>
          </div>
        )}
        <p className={styles.footnote}>Every stock, in context. Benchmark differences are in percentage points (pp).</p>
      </section>
    </>
  );
}
