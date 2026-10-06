import { emptyWatchlist, type WatchlistState } from "./watchlist-state";

/**
 * How this browser's copy of the watchlist and the account's saved one come
 * together when a signed-in page loads. The browser copy answers instantly;
 * the account's copy is what follows the user to other devices.
 *
 * - The account's list wins, except over a change made while it was loading.
 * - A list saved before accounts existed (no owner) moves into the first
 *   account that signs in here.
 * - A list another account left in this browser is never shown or uploaded.
 */
export function reconcileWatchlist({ server, local, localOwner, userId, editedBeforeLoad }: {
  server: WatchlistState | null;
  local: WatchlistState;
  /** The account the browser copy was last synced for; null before accounts. */
  localOwner: string | null;
  userId: string;
  editedBeforeLoad: boolean;
}): { local: WatchlistState; upload: WatchlistState | null } {
  const ownCopy = localOwner === null || localOwner === userId;
  if (!ownCopy) return { local: server ?? emptyWatchlist, upload: null };
  if (server && !editedBeforeLoad) return { local: server, upload: null };
  return { local, upload: isBlank(local) ? null : local };
}

function isBlank(state: WatchlistState) {
  return !state.tickers.length && !state.setupDismissed && !state.setupCompleted && !state.setupDraft;
}
