import { ArrowDownRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { formatPrice, formatPct } from "@/lib/format";
import { benchmarkFor, type ExploreStock } from "@/lib/explore-data";
import { StockLogo } from "./stock-logo";
import styles from "./explore-view.module.css";

export function ExploreCard({
  stock,
  added,
  onToggle,
}: {
  stock: ExploreStock;
  added: boolean;
  onToggle: () => void;
}) {
  const ahead = stock.vsBenchmarkPct >= 0;
  const gapWidth = Math.min(Math.abs(stock.vsBenchmarkPct) / 3, 1) * 50;
  const DayArrow = stock.changePct >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <article className={styles.card} aria-labelledby={`stock-${stock.ticker}`}>
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
            aria-pressed={added}
            aria-label={`${added ? "Remove" : "Add"} ${stock.ticker} ${added ? "from" : "to"} watchlist`}
            title={added ? "Remove from watchlist" : "Add to watchlist"}
          >
            {added ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          </button>
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
        <div className={styles.benchmarkLabel}>
          <span>vs. <strong>{benchmarkFor(stock)}</strong></span>
          <span className={ahead ? styles.positive : styles.negative}>
            {ahead ? "+" : "−"}{Math.abs(stock.vsBenchmarkPct).toFixed(2)} <small>pp</small>
          </span>
        </div>
        <div className={styles.gapTrack} aria-hidden="true">
          <span className={ahead ? styles.positive : styles.negative} style={{ left: `${ahead ? 50 : 50 - gapWidth}%`, width: `${gapWidth}%` }} />
        </div>
        <div className={styles.gapLabels}><span>Behind</span><span>Ahead</span></div>
      </div>
    </article>
  );
}
