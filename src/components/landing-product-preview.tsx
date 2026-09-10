import { Search, Plus, Check, ArrowUpRight } from "lucide-react";
import { holdings, overview } from "@/lib/watchlist-data";
import { compareSeries, compareBenchmark } from "@/lib/compare-data";
import { landingComparison } from "@/lib/landing-comparison";
import { formatPct } from "@/lib/format";
import styles from "./landing-app-tour.module.css";

export type PreviewPage = "dashboard" | "watchlist" | "compare" | "explore";

const sampleStocks = ["NVDA", "AAPL", "MSFT"].map((ticker) => holdings.find((stock) => stock.ticker === ticker)!);
// The two illustrations share one YTD benchmark so switching views stays coherent.
const overviewBenchmark = compareBenchmark.returnByRange.YTD;
const overviewGap = Math.round((overview.watchlistPct - overviewBenchmark) * 100) / 100;
const signedGap = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}`;

/** Deliberately simplified product illustrations, using the existing demo values. */
export function LandingProductPreview({ page }: { page: PreviewPage }) {
  return (
    <div className={styles.productIllustration} aria-hidden="true">
      {page === "dashboard" && <>
        <div className={styles.previewHeading}><span>Watchlist performance</span><span className={styles.rangeLabel}>YTD</span></div>
        <div className={styles.overviewMetrics}>
          <div><span>Your watchlist</span><strong>{formatPct(overview.watchlistPct, 1)}</strong></div>
          <div><span>S&amp;P 500</span><strong className={styles.mutedValue}>{formatPct(overviewBenchmark, 1)}</strong></div>
        </div>
        <MiniChart />
        <div className={styles.previewBottom}><span className={styles.up}>Ahead of the market</span><strong className={styles.up}>+{overviewGap.toFixed(2)} <small>pp</small></strong></div>
      </>}

      {page === "watchlist" && <>
        <div className={styles.previewHeading}><span>Your watchlist</span><span className={styles.rangeLabel}>3 stocks</span></div>
        <div className={styles.tableLabels}><span>Company</span><span>vs. benchmark</span></div>
        <div className={styles.stockRows}>
          {sampleStocks.map((stock, index) => <div className={styles.stockRow} key={stock.ticker}>
            <span className={`${styles.stockMonogram} ${index === 0 ? styles.selectedMonogram : ""}`}>{stock.ticker.slice(0, 1)}</span>
            <span className={styles.stockName}><strong>{stock.ticker}</strong><small>{stock.name.replace(/ (Corp|Inc\.).*$/, "")}</small></span>
            <span className={stock.vsBenchmarkPct >= 0 ? styles.up : styles.down}>{signedGap(stock.vsBenchmarkPct)} <small>pp</small><small className={styles.gapLabel}>{stock.vsBenchmarkPct >= 0 ? "Ahead" : "Behind"}</small></span>
          </div>)}
        </div>
        <div className={styles.previewBottom}><span>More than a price change.</span><ArrowUpRight size={16} /></div>
      </>}

      {page === "compare" && <>
        <div className={styles.previewHeading}><span>A common starting point</span><span className={styles.rangeLabel}>YTD</span></div>
        <div className={styles.seriesLegend}><span><i />NVDA</span><span><i />MSFT</span><span><i />S&amp;P 500</span></div>
        <MiniChart compare />
        <div className={styles.compareReturns}>
          {compareSeries.slice(0, 2).map((stock) => <div key={stock.ticker}><span>{stock.ticker}</span><strong>{formatPct(stock.returnByRange.YTD, 1)}</strong></div>)}
          <div><span>S&amp;P 500</span><strong>{formatPct(compareBenchmark.returnByRange.YTD, 1)}</strong></div>
        </div>
      </>}

      {page === "explore" && <>
        <div className={styles.previewHeading}><span>A world beyond your usual names</span><Search size={16} /></div>
        <div className={styles.sectorChips}><span className={styles.activeSector}>Technology</span><span>Healthcare</span><span>Energy</span></div>
        <div className={styles.discoveryLabel}>A few familiar faces</div>
        <div className={styles.stockRows}>
          {sampleStocks.map((stock, index) => <div className={styles.stockRow} key={stock.ticker}>
            <span className={styles.stockMonogram}>{stock.ticker.slice(0, 1)}</span>
            <span className={styles.stockName}><strong>{stock.name.replace(/ (Corp|Inc\.).*$/, "")}</strong><small>{stock.ticker}</small></span>
            <span className={index === 0 ? styles.added : styles.addStock}>{index === 0 ? <Check size={16} /> : <Plus size={16} />}</span>
          </div>)}
        </div>
      </>}
    </div>
  );
}

function MiniChart({ compare = false }: { compare?: boolean }) {
  const totals = compare
    ? [compareSeries[0].returnByRange.YTD, compareSeries[1].returnByRange.YTD, compareBenchmark.returnByRange.YTD]
    : [overview.watchlistPct, overviewBenchmark];
  const max = compare ? 45 : 18;
  const paths = totals.map((total, index) => {
    const shape = index === 0 ? landingComparison.stockReturns : landingComparison.benchmarkReturns;
    return shape.map((value, point) => `${8 + point / (shape.length - 1) * 376},${168 - value / shape[shape.length - 1] * total / max * 150}`).join(" ");
  });

  return <svg className={styles.miniChart} viewBox="0 0 400 192" fill="none">
    {[18, 68, 118, 168].map((y) => <line key={y} x1="8" x2="384" y1={y} y2={y} stroke="var(--color-line-soft)" strokeDasharray={y === 168 ? undefined : "3 5"} />)}
    {paths.map((points, index) => <polyline key={index} points={points} stroke={index === 0 ? "var(--color-ink)" : compare && index === 1 ? "var(--color-series-2)" : "var(--color-chart-benchmark)"} strokeWidth={index === 0 ? 2.4 : 1.7} strokeDasharray={index === paths.length - 1 ? "4 5" : undefined} strokeLinecap="round" strokeLinejoin="round" />)}
    <g fill="var(--color-text-caption)" fontSize="10"><text x="8" y="190">Jan</text><text x="188" y="190">Apr</text><text x="365" y="190">Aug</text></g>
  </svg>;
}
