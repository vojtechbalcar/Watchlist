import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { searchStocks } from "@/lib/stock-search";

/** The Explore search dropdown. Signed-in only: every search can spend API credits. */
export async function GET(request: Request) {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const results = await searchStocks(getDb(), new URL(request.url).searchParams.get("q"));
  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
