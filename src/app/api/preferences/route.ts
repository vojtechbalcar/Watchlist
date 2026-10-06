import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { readSavedPreferences, savePreferences } from "@/lib/account-state";

/** The signed-in account's preferences; synced like /api/watchlist. */
export async function GET() {
  const userId = (await auth())?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ state: await readSavedPreferences(getDb(), userId) }, { headers: { "Cache-Control": "no-store" } });
}

/** Replaces all preferences; the last write from any device wins. */
export async function PUT(request: Request) {
  const userId = (await auth())?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("state" in body)) return Response.json({ error: "Expected { state }" }, { status: 400 });
  return Response.json({ state: await savePreferences(getDb(), userId, body.state) });
}
