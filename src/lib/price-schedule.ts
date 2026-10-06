/**
 * What the price job should fetch next, as pure functions of the stored state
 * and the time. The US market runs 9:30–16:00 New York time on weekdays,
 * except NYSE holidays and the three 13:00 early closes (see marketHours).
 * Unscheduled closures, like a national day of mourning, aren't modelled.
 */

const MARKET_OPEN = 9 * 60 + 30;
const MARKET_CLOSE = 16 * 60;
const EARLY_CLOSE = 13 * 60;
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

const ymdOf = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
const weekdayOf = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day)).getUTCDay();

/** The `nth` given weekday of a month; a negative `nth` counts from the month's end. */
function nthWeekday(year: number, month: number, weekday: number, nth: number) {
  if (nth > 0) return ymdOf(year, month, 1 + (weekday - weekdayOf(year, month, 1) + 7) % 7 + (nth - 1) * 7);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return ymdOf(year, month, last - (weekdayOf(year, month, last) - weekday + 7) % 7 + (nth + 1) * 7);
}

/** A fixed-date holiday on a weekend moves to Friday or Monday. */
function observed(year: number, month: number, day: number) {
  const weekday = weekdayOf(year, month, day);
  return ymdOf(year, month, day + (weekday === 6 ? -1 : weekday === 0 ? 1 : 0));
}

/** Easter Sunday (anonymous Gregorian algorithm). */
function easter(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  return { month, day: ((h + l - 7 * m + 114) % 31) + 1 };
}

const holidayCache = new Map<number, Set<string>>();

/** NYSE full-day holidays in a year. New Year's Day on a Saturday isn't observed the Friday before. */
function holidays(year: number) {
  let days = holidayCache.get(year);
  if (!days) {
    const sunday = easter(year);
    days = new Set([
      ...(weekdayOf(year, 1, 1) === 6 ? [] : [observed(year, 1, 1)]),
      nthWeekday(year, 1, 1, 3),
      nthWeekday(year, 2, 1, 3),
      ymdOf(year, sunday.month, sunday.day - 2),
      nthWeekday(year, 5, 1, -1),
      observed(year, 6, 19),
      observed(year, 7, 4),
      nthWeekday(year, 9, 1, 1),
      nthWeekday(year, 11, 4, 4),
      observed(year, 12, 25),
    ]);
    holidayCache.set(year, days);
  }
  return days;
}

/**
 * When the market closes on a New York date, in minutes after midnight, or
 * null when there's no session. The early closes are July 3, the day after
 * Thanksgiving, and Christmas Eve, each when it is a trading day.
 */
export function marketHours(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  const weekday = weekdayOf(year, month, day);
  if (weekday === 0 || weekday === 6 || holidays(year).has(ymd)) return null;
  const thanksgiving = Number(nthWeekday(year, 11, 4, 4).slice(8));
  const early = [ymdOf(year, 7, 3), ymdOf(year, 11, thanksgiving + 1), ymdOf(year, 12, 24)].includes(ymd);
  return early ? EARLY_CLOSE : MARKET_CLOSE;
}

export function isMarketOpen(now: Date) {
  const { ymd, minutes } = nyClock(now);
  const close = marketHours(ymd);
  return close !== null && minutes >= MARKET_OPEN && minutes < close;
}

/** The most recent session whose bar has settled: its date and when it settled. */
export function latestSettledSession(now: Date) {
  const today = nyClock(now).ymd;
  const [year, month, day] = today.split("-").map(Number);
  for (let back = 0; back < 10; back++) {
    const ymd = ymdOf(year, month, day - back);
    const close = marketHours(ymd);
    if (close === null) continue;
    const settled = nyToUtc(ymd, close + SETTLE_MINUTES);
    if (settled <= now) return { ymd, settled };
  }
  throw new Error("No settled session in the last ten days");
}

/**
 * The latest session that had opened by `now`: today once the bell has rung,
 * otherwise the previous trading day. A quote fetched then is that session's.
 */
export function sessionOpenedBy(now: Date) {
  const { ymd: today, minutes } = nyClock(now);
  const [year, month, day] = today.split("-").map(Number);
  for (let back = 0; back < 10; back++) {
    const ymd = ymdOf(year, month, day - back);
    if (marketHours(ymd) !== null && (back > 0 || minutes >= MARKET_OPEN)) return ymd;
  }
  throw new Error("No session in the last ten days");
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
