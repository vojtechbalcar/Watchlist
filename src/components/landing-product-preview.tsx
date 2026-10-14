import Image from "next/image";
import { Search, Plus, Check, ArrowUpRight } from "lucide-react";
import { compareRows } from "@/lib/compare-data";
import { landingBenchmark as compareBenchmark, landingHoldings, landingStocks, landingWatchlistReturn } from "@/lib/landing-demo";
import { landingComparison } from "@/lib/landing-comparison";
import { formatPct } from "@/lib/format";
import { stockLogoFit, stockLogoSrc } from "@/lib/stock-logos";
import styles from "./landing-app-tour.module.css";

export type PreviewPage = "dashboard" | "watchlist" | "compare" | "explore";

const sampleStocks = landingHoldings;
const sampleComparison = compareRows(landingStocks, "YTD", ["NVDA", "MSFT"], compareBenchmark.returnByRange);
// The two illustrations share one YTD benchmark so switching views stays coherent.
const overviewBenchmark = compareBenchmark.returnByRange.YTD;
const overviewGap = Math.round((landingWatchlistReturn - overviewBenchmark) * 100) / 100;
// The tour's fixtures always have figures; the types allow gaps because live rows can.
const gapOf = (stock: { vsBenchmarkPct: number | null }) => stock.vsBenchmarkPct ?? 0;
const signedGap = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}`;
const shortName = (name: string) => name.replace(/ (Corp|Inc\.).*$/, "");

/** Deliberately simplified product illustrations, using the existing demo values. */
export function LandingProductPreview({ page }: { page: PreviewPage }) {
  return (
    <div className={styles.productIllustration} aria-hidden="true">
      {page === "dashboard" ? <>
        <div className={styles.previewHeading}><span>Watchlist performance</span><span className={styles.rangeLabel}>YTD</span></div>
        <div className={styles.overviewMetrics}>
          <div><span>Your watchlist</span><strong>{formatPct(landingWatchlistReturn, 1)}</strong></div>
          <div><span>S&amp;P 500</span><strong className={styles.mutedValue}>{formatPct(overviewBenchmark, 1)}</strong></div>
        </div>
        <MiniChart />
        <div className={styles.previewBottom}><span className={styles.up}>Ahead of the market</span><strong className={styles.up}>+{overviewGap.toFixed(2)} <small>pp</small></strong></div>
      </> : null}

      {page === "watchlist" ? <>
        <div className={styles.previewHeading}><span>Your watchlist</span><span className={styles.rangeLabel}>3 stocks</span></div>
        <div className={styles.tableLabels}><span>Company</span><span>vs. benchmark</span></div>
        <div>
          {sampleStocks.map((stock) => <div className={styles.stockRow} key={stock.ticker}>
            <CompanyTile ticker={stock.ticker} />
            <span className={styles.stockName}><strong>{stock.ticker}</strong><small>{shortName(stock.name)}</small></span>
            <span className={gapOf(stock) >= 0 ? styles.up : styles.down}>{signedGap(gapOf(stock))} <small>pp</small><small className={styles.gapLabel}>{gapOf(stock) >= 0 ? "Ahead" : "Behind"}</small></span>
          </div>)}
        </div>
        <div className={styles.previewBottom}><span>More than a price change.</span><ArrowUpRight size={16} /></div>
      </> : null}

      {page === "compare" ? <>
        <div className={styles.previewHeading}><span>A common starting point</span><span className={styles.rangeLabel}>YTD</span></div>
        <div className={styles.seriesLegend}><span><i />NVDA</span><span><i />MSFT</span><span><i />S&amp;P 500</span></div>
        <MiniChart compare />
        <div className={styles.compareReturns}>
          {sampleComparison.map((row) => <div key={row.series.ticker}><span>{row.series.ticker}</span><strong>{formatPct(row.returnPct ?? 0, 1)}</strong></div>)}
          <div><span>S&amp;P 500</span><strong>{formatPct(compareBenchmark.returnByRange.YTD, 1)}</strong></div>
        </div>
      </> : null}

      {page === "explore" ? <>
        <div className={styles.previewHeading}><span>A world beyond your usual names</span><Search size={16} /></div>
        <div className={styles.sectorChips}><span className={styles.activeSector}>Technology</span><span>Healthcare</span><span>Energy</span></div>
        <div className={styles.discoveryLabel}>A few familiar faces</div>
        <div>
          {sampleStocks.map((stock, index) => <div className={styles.stockRow} key={stock.ticker}>
            <CompanyTile ticker={stock.ticker} />
            <span className={styles.stockName}><strong>{shortName(stock.name)}</strong><small>{stock.ticker}</small></span>
            <span className={index === 0 ? styles.added : styles.addStock}>{index === 0 ? <Check size={16} /> : <Plus size={16} />}</span>
          </div>)}
        </div>
      </> : null}
    </div>
  );
}

/** The company's monochrome mark on a squircle, the same tile the hero orbits. */
function CompanyTile({ ticker }: { ticker: string }) {
  const src = stockLogoSrc(ticker);
  return <span className={styles.companyTile} data-fit={stockLogoFit(ticker)}>
    {src ? <Image src={src} alt="" width={20} height={20} /> : ticker.slice(0, 1)}
  </span>;
}

function MiniChart({ compare = false }: { compare?: boolean }) {
  const totals = compare
    ? [...sampleComparison.map(row => row.returnPct ?? 0), compareBenchmark.returnByRange.YTD]
    : [landingWatchlistReturn, overviewBenchmark];
  const max = compare ? 45 : 18;
  const paths = totals.map((total, index) => {
    const shape = index === 0 ? landingComparison.stockReturns : landingComparison.benchmarkReturns;
    return shape.map((value, point) => `${8 + point / (shape.length - 1) * 376},${168 - value / shape[shape.length - 1] * total / max * 150}`).join(" ");
  });

  return <svg className={styles.miniChart} viewBox="0 0 400 192" fill="none">
    {[18, 68, 118, 168].map((y) => <line key={y} x1="8" x2="384" y1={y} y2={y} stroke="var(--hairline-soft)" strokeDasharray={y === 168 ? undefined : "3 5"} />)}
    {paths.map((points, index) => <polyline key={index} points={points} stroke={index === 0 ? "var(--ink)" : compare && index === 1 ? "var(--color-series-2)" : "var(--color-chart-benchmark)"} strokeWidth={index === 0 ? 2.4 : 1.7} strokeDasharray={index === paths.length - 1 ? "4 5" : undefined} strokeLinecap="round" strokeLinejoin="round" />)}
    <g fill="var(--muted)" fontSize="10"><text x="8" y="190">Jan</text><text x="188" y="190">Apr</text><text x="365" y="190">Aug</text></g>
  </svg>;
}
