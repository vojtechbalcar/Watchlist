import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { getWatchlistListings } from "@/lib/listing-detail";
import { parseSymbols } from "@/lib/search-ranking";

/**
 * Figures and chart lines for watchlist stocks outside the tracked set.
 * Signed-in only, since a stale price can spend API credits.
 */
export async function GET(request: Request) {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const stocks = await getWatchlistListings(getDb(), parseSymbols(new URL(request.url).searchParams.get("symbols")));
  return Response.json({ stocks }, { headers: { "Cache-Control": "no-store" } });
}
