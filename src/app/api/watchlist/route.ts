import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { readJsonBody } from "@/lib/request-guards";
import { readSavedWatchlist, saveWatchlist } from "@/lib/account-state";

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
  const body = await readJsonBody(request);
  if (body === "too-large") return Response.json({ error: "Request body too large" }, { status: 413 });
  if (!body || typeof body !== "object" || !("state" in body)) return Response.json({ error: "Expected { state }" }, { status: 400 });
  return Response.json({ state: await saveWatchlist(getDb(), userId, body.state) });
}
