import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { readSavedWatchlist, saveWatchlist } from "@/lib/watchlist-account";

/** The signed-in account's watchlist; see src/lib/watchlist-sync.ts for how the browser uses it. */
export async function GET() {
  const userId = (await auth())?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ state: await readSavedWatchlist(getDb(), userId) }, { headers: { "Cache-Control": "no-store" } });
}

/** Replaces the whole list; the last write from any device wins. */
export async function PUT(request: Request) {
  const userId = (await auth())?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("state" in body)) return Response.json({ error: "Expected { state }" }, { status: 400 });
  return Response.json({ state: await saveWatchlist(getDb(), userId, body.state) });
}
