/** CRON_SECRET keeps the scheduled routes to the scheduler and GitHub Actions. */
export function isCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}
