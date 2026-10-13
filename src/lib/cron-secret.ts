import { bearerMatches } from "./request-guards";

/** CRON_SECRET keeps the scheduled routes to the scheduler and GitHub Actions. Compared in constant time. */
export function isCronRequest(request: Request) {
  return bearerMatches(request.headers.get("authorization"), process.env.CRON_SECRET);
}
