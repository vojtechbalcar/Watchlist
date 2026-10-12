import { MARKET_OPEN, isMarketOpen, latestSettledSession, nyClock, nyToUtc, type TrackedState } from "./price-schedule";

const MINUTE = 60 * 1000;

/** The scheduler fires every five minutes, so this long without a success means runs are failing or not firing. */
export const RUN_OVERDUE_MINUTES = 30;
/**
 * During market hours a quote is due after 50 minutes and the job refreshes
 * six per run, so with ~60 instruments none should go much past 100 minutes.
 */
export const QUOTE_OVERDUE_MINUTES = 150;
/** After a session settles, its final quotes and closes should be in within this. */
export const CATCH_UP_MINUTES = 180;

export const PRICE_JOB_SUCCEEDED = "price-job";
export const PRICE_JOB_FAILED = "price-job-failed";

export type PriceHealth = {
  healthy: boolean;
  problems: string[];
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  /** Tickers whose quote is overdue. */
  staleQuotes: string[];
  /** Tickers the job hasn't asked for the latest settled session's close. */
  staleCloses: string[];
};

const minutesAgo = (date: Date, now: Date) => Math.round((now.getTime() - date.getTime()) / MINUTE);

/**
 * Whether prices are as fresh as the schedule promises. Grace periods follow
 * the job's credit allowance, so a healthy rotation never trips them.
 */
export function priceHealth({ states, lastSuccess, lastFailure, now }: {
  states: TrackedState[];
  lastSuccess: Date | null;
  lastFailure: Date | null;
  now: Date;
}): PriceHealth {
  const problems: string[] = [];
  if (!lastSuccess) problems.push("The price job has no recorded successful run.");
  else if (minutesAgo(lastSuccess, now) > RUN_OVERDUE_MINUTES) problems.push(`The price job last succeeded ${minutesAgo(lastSuccess, now)} minutes ago.`);

  const session = latestSettledSession(now);
  const caughtUp = now.getTime() - session.settled.getTime() > CATCH_UP_MINUTES * MINUTE;
  let staleQuotes: TrackedState[] = [];
  if (isMarketOpen(now)) {
    // Quotes from before the bell count from the open, so the first rotation of the day isn't flagged.
    const opened = nyToUtc(nyClock(now).ymd, MARKET_OPEN).getTime();
    staleQuotes = states.filter(state => now.getTime() - Math.max(state.quoteFetchedAt?.getTime() ?? 0, opened) > QUOTE_OVERDUE_MINUTES * MINUTE);
  } else if (caughtUp) {
    staleQuotes = states.filter(state => !state.quoteFetchedAt || state.quoteFetchedAt < session.settled);
  }
  const staleCloses = caughtUp ? states.filter(state => !state.closesCheckedAt || state.closesCheckedAt < session.settled) : [];

  if (staleQuotes.length) problems.push(`${staleQuotes.length} of ${states.length} quotes are overdue.`);
  if (staleCloses.length) problems.push(`${staleCloses.length} of ${states.length} instruments are missing the ${session.ymd} close check.`);

  return {
    healthy: problems.length === 0,
    problems,
    lastSuccessAt: lastSuccess?.toISOString() ?? null,
    lastFailureAt: lastFailure?.toISOString() ?? null,
    staleQuotes: staleQuotes.map(state => state.ticker),
    staleCloses: staleCloses.map(state => state.ticker),
  };
}
