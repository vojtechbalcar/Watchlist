type View = "dashboard" | "watchlist" | "compare" | "explore" | "settings";

function Line({ wide = false }: { wide?: boolean }) {
  return <span className={`skeleton-line${wide ? " is-wide" : ""}`} />;
}

export function ChartSkeleton() {
  return <div className="skeleton-chart" aria-hidden="true"><Line /><div className="skeleton-metrics">{[0, 1, 2].map(i => <Line key={i} wide />)}</div><div className="skeleton-plot" /></div>;
}

export function TableSkeleton() {
  return <div className="skeleton-table" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <div key={i}>{[0, 1, 2, 3].map(j => <Line key={j} wide={j === 0} />)}</div>)}</div>;
}

export function LoadingSkeleton({ view = "dashboard" }: { view?: View }) {
  return <main className="page-shell loading-page" aria-busy="true" aria-label={`Loading ${view}`}>
    <p className="sr-only" role="status">Loading {view}…</p>
    <div aria-hidden="true" className="skeleton-heading"><Line /><Line wide /></div>
    {view === "explore" ? <div className="skeleton-cards" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div key={i}><Line /><Line wide /><div className="skeleton-quote" /><Line wide /></div>)}</div>
      : view === "settings" ? <div className="skeleton-settings" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <div key={i}><Line wide /><Line /></div>)}</div>
      : <>{view !== "watchlist" && <ChartSkeleton />}<TableSkeleton /></>}
  </main>;
}
