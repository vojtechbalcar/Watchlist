import { emptyWatchlist, type WatchlistState } from "./watchlist-state";

export type Reconcile<T> = {
  server: T | null;
  local: T;
  /** The account the browser copy was last synced for; null before accounts. */
  localOwner: string | null;
  userId: string;
  editedBeforeLoad: boolean;
};

/**
 * How this browser's copy of something saved per account (the watchlist,
 * preferences) and the account's copy come together when a signed-in page
 * loads. The browser copy answers instantly; the account's copy is what
 * follows the user to other devices.
 *
 * - The account's copy wins, except over a change made while it was loading.
 * - A copy saved before accounts existed (no owner) moves into the first
 *   account that signs in here.
 * - A copy another account left in this browser is never shown or uploaded.
 */
export function reconcileAccountCopy<T>({ server, local, localOwner, userId, editedBeforeLoad }: Reconcile<T>, empty: T, isBlank: (value: T) => boolean): { local: T; upload: T | null } {
  const ownCopy = localOwner === null || localOwner === userId;
  if (!ownCopy) return { local: server ?? empty, upload: null };
  if (server && !editedBeforeLoad) return { local: server, upload: null };
  return { local, upload: isBlank(local) ? null : local };
}

export function reconcileWatchlist(input: Reconcile<WatchlistState>) {
  return reconcileAccountCopy(input, emptyWatchlist, state => !state.tickers.length && !state.setupDismissed && !state.setupCompleted && !state.setupDraft);
}
