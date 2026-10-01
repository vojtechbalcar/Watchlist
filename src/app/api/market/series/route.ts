import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { readMarketSeries } from "@/lib/market-build";

/** Return lines for every tracked instrument, for the overview and Compare charts. */
export async function GET(request: Request) {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await readMarketSeries(getDb());
  const etag = `"${snapshot.builtAt.getTime()}"`;
  // The price job rebuilds these every few minutes in market hours.
  const headers = { ETag: etag, "Cache-Control": "private, max-age=300" };
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  return new Response(snapshot.body, { headers: { ...headers, "Content-Type": "application/json" } });
}
