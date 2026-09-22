import { ArrowDownRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { formatPrice, formatPct } from "@/lib/format";
import { benchmarkFor, type ExploreStock } from "@/lib/explore-data";
import type { ExplorePerformance, ExploreRange } from "@/lib/explore-performance";
import { StockLogo } from "./stock-logo";
import styles from "./explore-view.module.css";

export function ExploreCard({
  stock,
  performance,
  range,
  added,
  disabled = false,
  onToggle,
  onUndo,
}: {
  stock: ExploreStock;
  performance: ExplorePerformance | null;
  range: ExploreRange;
  added: boolean;
  disabled?: boolean;
  onToggle: () => void;
  /** Present only while this card's removal is still reversible. */
  onUndo?: () => void;
}) {
  const gap = performance?.gap ?? 0;
  const ahead = gap > 0;
  const gapClass = gap === 0 ? styles.neutral : ahead ? styles.positive : styles.negative;
  const gapScale = { "1D": 3, "1W": 5, "1M": 10, YTD: 30, "1Y": 50 }[range];
  const gapWidth = Math.min(Math.abs(gap) / gapScale, 1) * 50;
  const DayArrow = stock.changePct >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <article className={styles.card} aria-labelledby={`stock-${stock.ticker}`} data-ticker={stock.ticker}>
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <StockLogo stock={stock} />
          <div className={styles.company}>
            <h3 id={`stock-${stock.ticker}`}>{stock.ticker}</h3>
            <p title={stock.name}>{stock.name}</p>
          </div>
          <button
            type="button"
            className={styles.membership}
            onClick={onToggle}
            disabled={disabled}
            aria-pressed={added}
            aria-label={`${added ? "Remove" : "Add"} ${stock.ticker} ${added ? "from" : "to"} watchlist`}
            title={added ? "Remove from watchlist" : "Add to watchlist"}
          >
            {added ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          </button>
          {onUndo && <button type="button" className={styles.undo} onClick={onUndo} aria-label={`Undo removing ${stock.ticker} from watchlist`}>Undo</button>}
        </div>
        <div className={styles.quote}>
          <p className={styles.price}><span>$</span>{formatPrice(stock.price)}</p>
          <div className={styles.dayChange}>
            <span className={stock.changePct >= 0 ? styles.positive : styles.negative}>
              <DayArrow size={14} aria-hidden="true" />{formatPct(stock.changePct)}
            </span>
            <span>today</span>
          </div>
        </div>
      </div>
      <div className={styles.benchmark}>
        <dl className={styles.periodReturns}>
          <div><dt>{stock.ticker} <span>{range}</span></dt><dd data-return="stock">{performance ? formatPct(performance.stockReturn) : "—"}</dd></div>
          <div><dt>{benchmarkFor(stock)} <span>{range}</span></dt><dd data-return="benchmark">{performance ? formatPct(performance.benchmarkReturn) : "—"}</dd></div>
        </dl>
        <div className={styles.benchmarkLabel}>
          <span>{performance ? gap === 0 ? "In line with" : ahead ? "Ahead of" : "Behind" : "No data for"} <strong>{performance ? benchmarkFor(stock) : range}</strong></span>
          <span className={gapClass} data-return="gap">
            {performance ? <>{gap > 0 ? "+" : gap < 0 ? "−" : ""}{Math.abs(gap).toFixed(2)} <small>pp</small></> : "—"}
          </span>
        </div>
        {performance && <><div className={`${styles.gapTrack} gap-bar-preference`} aria-hidden="true">
          <span className={gapClass} style={{ left: `${ahead ? 50 : 50 - gapWidth}%`, width: `${gapWidth}%` }} />
        </div>
        <div className={`${styles.gapLabels} gap-bar-preference`} aria-hidden="true"><span>−{gapScale} pp</span><span>+{gapScale} pp</span></div></>}
      </div>
    </article>
  );
}
