import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { readDirectory } from "@/lib/stock-directory";

// The list changes once a day at most; after an hour the browser revalidates with the ETag.
const CACHE = "private, max-age=3600";

/** The stock directory search and the sector lists match against in the browser. */
export async function GET(request: Request) {
  if (!(await auth())?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await readDirectory(getDb());
  const etag = `"${snapshot.builtAt.getTime()}"`;
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": CACHE } });
  return new Response(snapshot.body, { headers: { "Content-Type": "application/json", ETag: etag, "Cache-Control": CACHE } });
}
