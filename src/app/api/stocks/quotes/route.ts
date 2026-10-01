import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { parseSymbols } from "@/lib/search-ranking";
import { getQuotes } from "@/lib/stock-quotes";

/**
 * Prices for up to 60 stocks. `live=1` (search) may fetch the first six from
 * Twelve Data; without it (sector lists) only stored prices are returned.
 * Signed-in only, since a live request can spend API credits.
 */
export async function GET(request: Request) {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const quotes = await getQuotes(getDb(), parseSymbols(params.get("symbols")), params.get("live") === "1");
  return Response.json({ quotes }, { headers: { "Cache-Control": "no-store" } });
}
