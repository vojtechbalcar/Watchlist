/**
 * What the price job should fetch next, as pure functions of the stored state
 * and the time. The US market runs 9:30–16:00 New York time on weekdays;
 * holidays aren't modelled, so on one the job just finds nothing new.
 */

const MARKET_OPEN = 9 * 60 + 30;
const MARKET_CLOSE = 16 * 60;
/** Twelve Data settles the day's bar shortly after the close. */
const SETTLE_MINUTES = 15;

/** During market hours a tracked quote is refreshed once it is this old. */
export const QUOTE_STALE_MINUTES = 50;
/** The symbol list changes rarely; sync it about once a day. */
export const SYMBOL_SYNC_HOURS = 20;
/** About 1.5 years of sessions, enough for 1Y and YTD. */
export const BACKFILL_SESSIONS = 400;
export const TOPUP_SESSIONS = 30;

const MINUTE = 60 * 1000;

const nyFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York", hourCycle: "h23",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short",
});
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** New York's calendar date, weekday (0 = Sunday), and minute of the day at `now`. */
export function nyClock(now: Date) {
  const parts = Object.fromEntries(nyFormat.formatToParts(now).map(part => [part.type, part.value]));
  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: weekdays.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/** The instant a New York wall-clock time occurs. */
export function nyToUtc(ymd: string, minutes: number) {
  const [year, month, day] = ymd.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day, 0, minutes);
  const wall = nyClock(new Date(guess));
  const [wy, wm, wd] = wall.ymd.split("-").map(Number);
  const offset = Date.UTC(wy, wm - 1, wd, 0, wall.minutes) - guess;
  return new Date(guess - offset);
}

export function isMarketOpen(now: Date) {
  const { weekday, minutes } = nyClock(now);
  return weekday >= 1 && weekday <= 5 && minutes >= MARKET_OPEN && minutes < MARKET_CLOSE;
}

/** The most recent weekday session whose bar has settled: its date and when it settled. */
export function latestSettledSession(now: Date) {
  const today = nyClock(now).ymd;
  const [year, month, day] = today.split("-").map(Number);
  for (let back = 0; back < 8; back++) {
    const date = new Date(Date.UTC(year, month - 1, day - back));
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) continue;
    const ymd = date.toISOString().slice(0, 10);
    const settled = nyToUtc(ymd, MARKET_CLOSE + SETTLE_MINUTES);
    if (settled <= now) return { ymd, settled };
  }
  throw new Error("No settled session in the last week");
}

export type TrackedState = {
  ticker: string;
  /** The newest stored close, as YYYY-MM-DD. */
  latestClose: string | null;
  closesCheckedAt: Date | null;
  quoteFetchedAt: Date | null;
};

const oldestFirst = (time: (state: TrackedState) => Date | null) => (a: TrackedState, b: TrackedState) =>
  (time(a)?.getTime() ?? 0) - (time(b)?.getTime() ?? 0);

/** Instruments that haven't been asked for closes since the latest session settled. */
export function closesDue(states: TrackedState[], now: Date) {
  const { settled } = latestSettledSession(now);
  return states
    .filter(state => !state.closesCheckedAt || state.closesCheckedAt < settled)
    .sort(oldestFirst(state => state.closesCheckedAt));
}

/**
 * During market hours, quotes older than QUOTE_STALE_MINUTES. Outside them,
 * one final refresh after the latest session settles, then nothing until the
 * next open.
 */
export function quotesDue(states: TrackedState[], now: Date) {
  const due = isMarketOpen(now)
    ? (fetched: Date) => now.getTime() - fetched.getTime() >= QUOTE_STALE_MINUTES * MINUTE
    : (fetched: Date) => fetched < latestSettledSession(now).settled;
  return states
    .filter(state => !state.quoteFetchedAt || due(state.quoteFetchedAt))
    .sort(oldestFirst(state => state.quoteFetchedAt));
}

export function symbolSyncDue(ranAt: Date | null, now: Date) {
  return !ranAt || now.getTime() - ranAt.getTime() >= SYMBOL_SYNC_HOURS * 60 * MINUTE;
}

export function sessionsToFetch(state: TrackedState) {
  return state.latestClose ? TOPUP_SESSIONS : BACKFILL_SESSIONS;
}
