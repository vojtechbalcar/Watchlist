"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StockLogo } from "./stock-logo";
import { formatPct, formatPrice } from "@/lib/format";
import { benchmarkFor, biggestMarketBeater, exploreUniverse, primarySectors, moreSectors, type Sector, type ExploreStock } from "@/lib/explore-data";

function Gap({ value }: { value: number }) {
  return <span className={value >= 0 ? "text-up" : "text-down"}>{value >= 0 ? "+" : "−"}{Math.abs(value).toFixed(2)} <small>pp</small></span>;
}
function MembershipButton({ stock, added, onToggle }: { stock: ExploreStock; added: boolean; onToggle: () => void }) {
  return <button className={"membership-button " + (added ? "is-added" : "")} onClick={onToggle} aria-pressed={added} aria-label={`${added ? "Remove" : "Add"} ${stock.ticker} ${added ? "from" : "to"} watchlist`}>{added ? "✓ Added" : "＋ Add"}</button>;
}
export function ExploreView({ watchlistTickers }: { watchlistTickers: string[] }) {
  const [sector, setSector] = useState<Sector | "All">("All");
  const [filter, setFilter] = useState("All stocks");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(watchlistTickers);
  const [sort, setSort] = useState("default");
  const sectorStocks = exploreUniverse.filter(s => sector === "All" || s.sector === sector);
  const beating = sectorStocks.filter(s => s.vsBenchmarkPct > 0).length;
  const hero = biggestMarketBeater(sectorStocks);
  const mover = [...sectorStocks].sort((a, b) => b.changePct - a.changePct)[0];
  const stocks = useMemo(() => {
    const result = exploreUniverse.filter(s => sector === "All" || s.sector === sector)
      .filter(s => (s.ticker + " " + s.name).toLowerCase().includes(query.trim().toLowerCase()))
      .filter(s => filter === "All stocks" || (filter === "Ahead" ? s.vsBenchmarkPct > 0 : s.vsBenchmarkPct <= 0));
    if (sort === "gap") result.sort((a, b) => b.vsBenchmarkPct - a.vsBenchmarkPct);
    if (sort === "price") result.sort((a, b) => b.price - a.price);
    if (sort === "day") result.sort((a, b) => b.changePct - a.changePct);
    if (sort === "company") result.sort((a, b) => a.ticker.localeCompare(b.ticker));
    return result;
  }, [sector, query, filter, sort]);
  function toggle(ticker: string) { setAdded(prev => prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]); }
  return <>
    <div className="page-heading"><div><p className="eyebrow">Find your next stock to watch</p><h1 className="page-title">Explore</h1></div><div className="page-actions"><Link href="/compare">Compare stocks &nbsp; ↗</Link><Link href="/watchlist" className="primary-action">Your watchlist ↗</Link></div></div>
    <div className="sector-toolbar"><label className="sector-select"><span className="control-label">Market</span><select aria-label="Filter by sector" value={sector} onChange={e => setSector(e.target.value as Sector | "All")}><option value="All">All sectors</option>{[...primarySectors, ...moreSectors].map(s => <option key={s}>{s}</option>)}</select></label><p>Each stock measured against its sector benchmark <span className="period-tag ml-2">1D</span></p></div>
    <section className="discovery-summary" aria-label="Market highlights">
      <div className="discovery-breadth"><div className="aside-heading"><h2>Beating their market</h2><span className="period-tag">1D</span></div><div className="beating-count"><strong>{beating}</strong><span>/ {sectorStocks.length}</span><small>stocks ahead</small></div><div className="breadth-track" aria-label={`${beating} of ${sectorStocks.length} stocks ahead`}><span style={{width: beating / sectorStocks.length * 100 + "%"}} /></div><div className="beating-key"><span>• {beating} ahead</span><span>• {sectorStocks.length - beating} behind</span></div></div>
      {hero && <div className="discovery-highlight"><div className="aside-heading"><h2>{hero.vsBenchmarkPct >= 0 ? "Strongest vs. market" : "Closest to its market"}</h2><span className="text-text-muted">↗</span></div><div className="highlight-stock"><StockLogo stock={hero} /><div><strong>{hero.ticker}</strong><small>{hero.name}</small></div><span className="highlight-number"><Gap value={hero.vsBenchmarkPct} /><small>vs. {benchmarkFor(hero)}</small></span></div><div className="highlight-footer"><span>{hero.sector}</span><MembershipButton stock={hero} added={added.includes(hero.ticker)} onToggle={() => toggle(hero.ticker)} /></div></div>}
      {mover && <div className="discovery-highlight"><div className="aside-heading"><h2>Today’s top gainer</h2><span className="text-text-muted">↗</span></div><div className="highlight-stock"><StockLogo stock={mover} /><div><strong>{mover.ticker}</strong><small>{mover.name}</small></div><span className={"highlight-number " + (mover.changePct >= 0 ? "text-up" : "text-down")}>{formatPct(mover.changePct)}<small>today</small></span></div><div className="highlight-footer"><span>{formatPrice(mover.price)}</span><MembershipButton stock={mover} added={added.includes(mover.ticker)} onToggle={() => toggle(mover.ticker)} /></div></div>}
    </section>
    <section className="discovery-stocks" aria-label="Discover stocks"><div className="section-heading"><h2>{sector === "All" ? "Discover stocks" : sector}<small>{sectorStocks.length} stocks</small></h2><span className="text-sm text-text-muted">Daily market snapshot</span></div>
      <div className="stock-toolbar"><div className="stock-tabs" role="tablist" aria-label="Filter by performance">{["All stocks", "Ahead", "Behind"].map((tab, i) => <button key={tab} role="tab" aria-selected={filter === tab} onClick={() => setFilter(tab)}>{tab}<span>{[sectorStocks.length, beating, sectorStocks.length - beating][i]}</span></button>)}</div><label className="stock-search"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" /><path d="m13 13 5 5" stroke="currentColor" /></svg><input type="search" aria-label="Search stocks" placeholder="Search stocks" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      <div className="stock-table-scroll"><table className="discovery-table"><caption className="sr-only">Discover stocks and compare their daily performance against sector benchmarks</caption><thead><tr><th scope="col"><button onClick={() => setSort("company")}>Company ⇅</button></th><th scope="col">Sector</th><th scope="col"><button onClick={() => setSort("price")}>Last price ⇅</button></th><th scope="col"><button onClick={() => setSort("day")}>Day change ⇅</button></th><th scope="col"><button onClick={() => setSort("gap")}>vs. sector benchmark ⇅</button></th><th scope="col"><span className="sr-only">Watchlist</span></th></tr></thead><tbody>{stocks.map(stock => <tr key={stock.ticker}><th scope="row"><span className="stock-company"><StockLogo stock={stock} /><span><strong>{stock.ticker}</strong><small>{stock.name}</small></span></span></th><td className="text-text-muted">{stock.sector}</td><td>{formatPrice(stock.price)}</td><td className={stock.changePct >= 0 ? "text-up" : "text-down"}>{formatPct(stock.changePct)}</td><td><Gap value={stock.vsBenchmarkPct} /><small className="benchmark-name">{benchmarkFor(stock)}</small></td><td><MembershipButton stock={stock} added={added.includes(stock.ticker)} onToggle={() => toggle(stock.ticker)} /></td></tr>)}{stocks.length === 0 && <tr><td colSpan={6} className="!text-center text-text-muted">No stocks match your filters. Try another sector or search.</td></tr>}</tbody></table></div>
      <div className="stock-table-footer"><span>{stocks.length} of {sectorStocks.length} stocks</span><span>Benchmark differences in percentage points</span></div>
    </section>
  </>;
}
