import { sectors } from "./explore-data";
import { availableWatchlistTickers } from "./watchlist-catalog";
import { parseWatchlist, WATCHLIST_KEY, type WatchlistState } from "./watchlist-state";

/** Never base a write on a fallback snapshot after a failed storage read. */
export function writeWatchlistStorage(
  storage: Pick<Storage, "getItem" | "setItem">,
  update: (state: WatchlistState) => WatchlistState | null,
): boolean {
  try {
    const state = parseWatchlist(storage.getItem(WATCHLIST_KEY), availableWatchlistTickers, sectors);
    const next = update(state);
    if (!next) return false;
    storage.setItem(WATCHLIST_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}
