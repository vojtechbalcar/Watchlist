import exploreStyles from "./explore-view.module.css";

/** A stand-in sized like the content it replaces, so nothing jumps when data lands. */
export function Skeleton({ width, height = 12, radius, className }: {
  width?: number | string; height?: number | string; radius?: number; className?: string;
}) {
  return <span className={["skeleton", className].filter(Boolean).join(" ")} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}

/** Skeletons say nothing to a screen reader, so every boundary names what it is waiting for. */
export function LoadingStatus({ children }: { children: string }) {
  return <p className="sr-only" role="status">{children}</p>;
}

export function MarketBarSkeleton() {
  return <div className="market-summary-bar h-marketbar overflow-hidden border-b border-line bg-surface-sunken" aria-hidden="true">
    <div className="mx-auto flex h-full max-w-(--container-page) items-center px-8">
      <span className="shrink-0 pr-8 text-base tracking-ticker text-text-faint">MARKETS</span>
      <div className="flex h-[28px] min-w-0 flex-1 items-center justify-between overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[0, 1, 2, 3].map(i => <div key={i} className="flex shrink-0 items-center gap-3 border-l border-line px-6">
          <Skeleton width={62} height={11} /><Skeleton width={54} height={11} /><Skeleton width={42} height={11} />
        </div>)}
      </div>
    </div>
  </div>;
}

export function PageHeadingSkeleton({ actions = 2 }: { actions?: number }) {
  return <div className="page-heading" aria-hidden="true">
    <div><Skeleton width={200} height={10} /><Skeleton width={196} height={38} className="mt-4" /></div>
    <div className="page-actions">{Array.from({ length: actions }, (_, i) => <Skeleton key={i} width={i === actions - 1 ? 118 : 96} height={i === actions - 1 ? 40 : 20} radius={4} />)}</div>
  </div>;
}

export function OverviewCardSkeleton() {
  return <section className="overview-panel" aria-hidden="true">
    <div className="overview-main">
      <div className="overview-top"><Skeleton width="44%" height={17} /><Skeleton width={186} height={28} radius={4} /></div>
      <dl className="overview-metrics">{[0, 1, 2].map(i => <div key={i}>
        <dt><Skeleton width="82%" height={11} /></dt><dd><Skeleton width="68%" height={30} /></dd>
      </div>)}</dl>
      <figure><Skeleton height={240} radius={4} /></figure>
      <div className="chart-caption"><Skeleton width="38%" height={10} /><Skeleton width="46%" height={10} /></div>
    </div>
    <aside className="overview-aside">
      <div><div className="aside-heading"><Skeleton width="56%" height={14} /><Skeleton width={42} height={18} radius={3} /></div>
        <Skeleton width={130} height={34} className="mt-5" /><Skeleton height={8} radius={2} className="mt-5" /></div>
      <div className="movers"><div className="aside-heading"><Skeleton width="48%" height={14} /><Skeleton width={34} height={18} radius={3} /></div>
        {[0, 1].map(i => <div key={i} className="mover"><Skeleton width={110} height={10} /><Skeleton height={34} radius={4} className="mt-4" /></div>)}
      </div>
    </aside>
  </section>;
}

const columns = ["Company", "Last price", "Day change", "vs. S&P 500  YTD"];
export function WatchlistTableSkeleton({ compact = false, rows = 5 }: { compact?: boolean; rows?: number }) {
  return <section aria-label="Your watchlist">
    <LoadingStatus>Loading your watchlist…</LoadingStatus>
    <div aria-hidden="true">
      {compact ? <div className="section-heading"><Skeleton width={210} height={18} /><Skeleton width={110} height={12} /></div>
        : <div className="page-heading"><div><Skeleton width={190} height={10} /><Skeleton width={230} height={38} className="mt-4" /><Skeleton width={260} height={13} className="mt-4" /></div><Skeleton width={128} height={40} radius={4} /></div>}
      <div className="stock-toolbar">
        <div className="stock-tabs">{[84, 58, 64].map(width => <Skeleton key={width} width={width} height={30} radius={4} />)}</div>
        <span className="stock-search"><Skeleton height={14} /></span>
      </div>
      <div className="stock-table-scroll">
        <table className="stock-table">
          <thead><tr>{columns.map(label => <th key={label} scope="col">{label}</th>)}{!compact && <th scope="col" />}</tr></thead>
          <tbody>{Array.from({ length: rows }, (_, row) => <tr key={row}>
            <th scope="row"><span className="stock-company"><Skeleton width={36} height={36} radius={18} /><span><Skeleton width={52} height={13} /><Skeleton width={104} height={11} className="mt-2" /></span></span></th>
            <td><Skeleton width={64} height={13} className="ml-auto" /></td>
            <td><Skeleton width={72} height={13} className="ml-auto" /></td>
            <td><span className="benchmark-cell"><Skeleton width={62} height={13} /><Skeleton width={106} height={5} radius={2} /></span></td>
            {!compact && <td />}
          </tr>)}</tbody>
        </table>
      </div>
      <div className="stock-table-footer"><Skeleton width={104} height={10} /><Skeleton width={210} height={10} /></div>
    </div>
  </section>;
}

export function ExploreViewSkeleton({ cards = 8 }: { cards?: number }) {
  return <section aria-label="Browse stocks by sector">
    <LoadingStatus>Loading stocks to explore…</LoadingStatus>
    <div aria-hidden="true">
      <div className="page-heading"><div><Skeleton width={210} height={10} /><Skeleton width={188} height={38} className="mt-4" /><Skeleton width={240} height={13} className="mt-4" /></div><Skeleton width={150} height={20} /></div>
      <div className={exploreStyles.periodToolbar}><Skeleton width={290} height={12} /><Skeleton width={230} height={28} radius={4} /></div>
      <div className={exploreStyles.toolbar}><Skeleton width={340} height={42} radius={4} /><div className={exploreStyles.filters}><Skeleton width={160} height={42} radius={4} /><Skeleton width={160} height={42} radius={4} /></div></div>
      <div className={exploreStyles.grid}>{Array.from({ length: cards }, (_, card) => <div key={card} className={exploreStyles.card}>
        <div className={exploreStyles.cardBody}>
          <div className={exploreStyles.cardHeader}><Skeleton width={38} height={38} radius={19} /><span className={exploreStyles.company}><Skeleton width={54} height={15} /><Skeleton width={98} height={11} className="mt-2" /></span><Skeleton width={30} height={30} radius={15} /></div>
          <div className={exploreStyles.quote}><Skeleton width={128} height={32} /><Skeleton width={104} height={12} className="mt-3" /></div>
        </div>
        <div className={exploreStyles.benchmark}><Skeleton height={40} radius={4} /><Skeleton height={14} radius={3} className="mt-4" /><Skeleton height={6} radius={3} className="mt-4" /></div>
      </div>)}</div>
    </div>
  </section>;
}

/** The picker, chart, and table below Compare's heading, which the view renders itself. */
export function CompareBodySkeleton() {
  return <>
    <LoadingStatus>Loading your saved stocks…</LoadingStatus>
    <div aria-hidden="true">
      <Skeleton height={44} radius={4} className="mt-6" />
      <Skeleton height={320} radius={4} className="mt-6" />
      <Skeleton height={190} radius={4} className="mt-6" />
    </div>
  </>;
}

export function CompareViewSkeleton() {
  return <>
    <div className="page-heading" aria-hidden="true"><div><Skeleton width={200} height={10} /><Skeleton width={190} height={38} className="mt-4" /></div><Skeleton width={230} height={20} /></div>
    <CompareBodySkeleton />
  </>;
}

export function SettingsViewSkeleton() {
  return <>
    <LoadingStatus>Loading your settings…</LoadingStatus>
    <div aria-hidden="true">
      <div className="page-heading settings-heading"><div><Skeleton width={150} height={10} /><Skeleton width={180} height={38} className="mt-4" /><Skeleton width={290} height={13} className="mt-4" /></div><Skeleton width={170} height={14} /></div>
      <div className="settings-layout">
        <aside className="settings-sidebar">{[0, 1, 2, 3].map(i => <Skeleton key={i} height={34} radius={4} className="mt-2" />)}</aside>
        <div className="settings-content">{[0, 1, 2].map(i => <Skeleton key={i} height={200} radius={4} className="mt-6" />)}</div>
      </div>
    </div>
  </>;
}
