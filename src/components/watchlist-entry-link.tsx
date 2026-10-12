import type { ReactNode } from "react";

/** Recheck the session and account copy on click, even after signing in in another tab. */
export function WatchlistEntryLink({ children, className }: { children: ReactNode; className?: string }) {
  return <a href="/watchlist?setup=continue" className={className}>{children}</a>;
}
