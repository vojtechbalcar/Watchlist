"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Search, X } from "lucide-react";
import { exploreUniverse, sectors, sectorDescriptions, type Sector } from "@/lib/explore-data";
import { watchlistRows } from "@/lib/watchlist-catalog";
import { compareBenchmark } from "@/lib/compare-data";
import { formatPct, formatPrice } from "@/lib/format";
import { completeWatchlistSetup, dismissWatchlistSetup } from "./watchlist-store";
import { StockLogo } from "./stock-logo";
import styles from "./watchlist-setup.module.css";

const stepNames = ["Your interests", "Choose stocks", "See the context"];
const titles = ["What catches your eye?", "Pick your first stocks.", "Meet your benchmark."];
const descriptions = [
  "Choose the sectors you’re curious about. Or continue to browse everything.",
  "Start with companies you know. One is enough, and you can always add more.",
  "A stock can rise and still trail the market. Here’s how to tell the difference.",
];

export function WatchlistSetup({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<Sector[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    title.current?.focus();
  }, [step]);

  const stocks = exploreUniverse.filter(stock => !interests.length || interests.includes(stock.sector))
    .filter(stock => `${stock.ticker} ${stock.name}`.toLowerCase().includes(query.trim().toLowerCase()));
  const chosen = exploreUniverse.filter(stock => selected.includes(stock.ticker));
  const example = watchlistRows([selected[0] ?? "MSFT"])[0];
  const benchmarkReturn = compareBenchmark.returnByRange.YTD;
  const returnPct = benchmarkReturn + example.vsBenchmarkPct;
  const gap = example.vsBenchmarkPct;

  function changeStep(next: number) { setError(""); setStep(next); }
  function toggleStock(ticker: string) {
    setSelected(previous => previous.includes(ticker) ? previous.filter(item => item !== ticker) : [...previous, ticker]);
  }
  function finish() {
    if (!selected.length) { changeStep(1); return; }
    if (completeWatchlistSetup(selected)) onComplete();
    else setError("Your browser couldn’t save the watchlist. Allow site storage, then try again. Your choices are still here.");
  }

  return <section className={styles.setup} aria-label="Watchlist setup">
    <div className={styles.heading}><div><p className="eyebrow">A few stocks. A clearer perspective.</p><h1 className="page-title">Build your first watchlist</h1><p>Your starting point for seeing stocks in context.</p></div><button className={styles.skip} onClick={() => { dismissWatchlistSetup(); onSkip(); router.push("/explore"); }}>I’ll explore on my own <ArrowRight size={14} aria-hidden="true" /></button></div>
    <ol className={styles.steps} aria-label="Setup progress">{stepNames.map((name, index) => <li key={name} aria-current={index === step ? "step" : undefined} data-complete={index < step}><span>{index < step ? <Check size={13} aria-hidden="true" /> : `0${index + 1}`}</span>{name}</li>)}</ol>
    <div className={styles.layout}>
      <div className={styles.main}>
        <p className={styles.stepCount}>STEP {step + 1} OF 3</p>
        <h2 ref={title} tabIndex={-1}>{titles[step]}</h2><p className={styles.description}>{descriptions[step]}</p>

        {step === 0 && <div className={styles.sectors}>{sectors.map(sector => <label key={sector} className={styles.sector} data-selected={interests.includes(sector)}><input type="checkbox" className="sr-only" checked={interests.includes(sector)} onChange={() => setInterests(previous => previous.includes(sector) ? previous.filter(item => item !== sector) : [...previous, sector])} /><span className={styles.sectorTop}><strong>{sector}</strong><span className={styles.checkBox} aria-hidden="true">{interests.includes(sector) && <Check size={12} />}</span></span><span className={styles.sectorDescription}>{sectorDescriptions[sector]}</span></label>)}</div>}

        {step === 1 && <>
          <div className={styles.stockToolbar}><label className={styles.search}><Search size={15} aria-hidden="true" /><input type="search" aria-label="Search stocks for your watchlist" placeholder="Search a company or symbol" value={query} onChange={event => setQuery(event.target.value)} /></label><span>{interests.length ? `${interests.length} ${interests.length === 1 ? "sector" : "sectors"}` : "All sectors"}{interests.length > 0 && <button onClick={() => setInterests([])}>Browse all</button>}</span></div>
          <fieldset className={styles.stockPicker}><legend className="sr-only">Choose stocks for your watchlist</legend>{stocks.map(stock => <label key={stock.ticker} className={styles.stockOption} data-selected={selected.includes(stock.ticker)}><input type="checkbox" className="sr-only" aria-label={`${stock.ticker} · ${stock.name}`} checked={selected.includes(stock.ticker)} onChange={() => toggleStock(stock.ticker)} /><StockLogo stock={stock} /><span className={styles.stockName}><strong>{stock.ticker}</strong><small>{stock.name}</small></span><span className={styles.stockPrice}>${formatPrice(stock.price)}</span><span className={styles.checkBox} aria-hidden="true">{selected.includes(stock.ticker) && <Check size={12} />}</span></label>)}</fieldset>
          {stocks.length === 0 && <div className={styles.noResults}><p>No companies match this search.</p><button onClick={() => { setQuery(""); setInterests([]); }}>Browse all stocks</button></div>}
          <p className={styles.snapshot}>Illustrative stock prices · USD · Aug 25 snapshot</p>
        </>}

        {step === 2 && <div className={styles.review}>
          <div className={styles.benchmarkIntro}><span className={styles.benchmarkMark}>S&P</span><div><h3>S&P 500</h3><p>Your watchlist’s broad-market reference. It gives each stock’s return something to measure up to.</p></div><span className="period-tag">YTD</span></div>
          <div className={styles.comparison}><div className={styles.comparisonHeading}><span>One of your stocks, in context</span><span>Year to date</span></div><div className={styles.exampleStock}><StockLogo stock={example} /><span><strong>{example.ticker}</strong><small>{example.name}</small></span></div><dl><div><dt>{example.ticker} return</dt><dd>{formatPct(returnPct)}</dd></div><div><dt>S&P 500 return</dt><dd>{formatPct(benchmarkReturn)}</dd></div><div><dt>Difference</dt><dd className={gap > 0 ? "text-up" : gap < 0 ? "text-down" : "text-text-secondary"}>{gap > 0 ? "+" : gap < 0 ? "−" : ""}{Math.abs(gap).toFixed(2)} <small>pp</small></dd></div></dl><p>{gap === 0 ? `${example.ticker} is in line with the S&P 500.` : `${example.ticker} is ${Math.abs(gap).toFixed(2)} percentage points ${gap > 0 ? "ahead of" : "behind"} the S&P 500.`} That’s the context a price alone can’t give you.</p></div>
          <p className={styles.reviewNote}>Your watchlist starts with year-to-date comparisons. In Explore, each company is compared with its own sector benchmark. You can choose other periods there.</p>
        </div>}

        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}><div>{step > 0 && <button className={styles.back} onClick={() => changeStep(step - 1)}><ArrowLeft size={14} aria-hidden="true" />Back</button>}</div><span>{step === 0 ? (interests.length ? `${interests.length} selected` : "All sectors welcome") : `${selected.length} ${selected.length === 1 ? "stock" : "stocks"} selected`}</span><button className="primary-action" disabled={step > 0 && selected.length === 0} onClick={() => step === 2 ? finish() : changeStep(step + 1)}>{step === 2 ? "Create my watchlist" : "Continue"}<ArrowRight size={14} aria-hidden="true" /></button></div>
      </div>
      <aside className={styles.aside} aria-label="Your watchlist preview">
        <p className="eyebrow">Your starting point</p><h2>{selected.length ? `${selected.length} ${selected.length === 1 ? "company" : "companies"} to watch.` : "Curiosity comes first."}</h2><p>{selected.length ? "A watchlist follows companies you’re interested in. You don’t need to own their shares." : "You don’t need to know everything about the market. Start with a company you want to understand."}</p>
        {chosen.length > 0 ? <><div className={styles.chosen}>{chosen.map(stock => <span key={stock.ticker}>{stock.ticker}{step !== 2 && <button aria-label={`Remove ${stock.ticker} from selection`} onClick={() => toggleStock(stock.ticker)}><X size={12} aria-hidden="true" /></button>}</span>)}</div>{step === 2 && <button className={styles.edit} onClick={() => changeStep(1)}>Edit your selection</button>}</> : <div className={styles.example}><div><span>Stock return</span><strong>+13.21%</strong></div><div><span>Market return</span><strong>+14.60%</strong></div><p className="text-down">−1.39 pp behind the market</p><small>Illustrative example · MSFT vs. S&P 500, YTD</small></div>}
        <div className={styles.storageNote}><span>Made for watching.</span><p>Saved in this browser. Add or remove companies whenever you like. All figures are demo data.</p></div>
      </aside>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{selected.length} stocks selected.</p>
  </section>;
}
