export const PREFERENCES_KEY = "watchlist.preferences.v1";

export const defaultPreferences = {
  displayName: "",
  density: "comfortable" as "comfortable" | "compact",
  showLogos: true,
  showCompanyNames: true,
  showGapBars: true,
  showMarketSummary: true,
  reducedMotion: false,
  compareRange: "YTD" as "1D" | "1W" | "1M" | "YTD" | "1Y",
  watchlistSort: "original" as "original" | "ticker" | "price" | "changePct" | "vsBenchmarkPct",
  sortDirection: "ascending" as "ascending" | "descending",
  watchlistFilter: "All stocks" as "All stocks" | "Ahead" | "Behind",
};

export type Preferences = typeof defaultPreferences;

/** Browser storage is untrusted: recover valid fields and default everything else. */
export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return defaultPreferences;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return defaultPreferences;
    const source = value as Record<string, unknown>;
    const result = { ...defaultPreferences };
    if (typeof source.displayName === "string") result.displayName = source.displayName.trim().slice(0, 60);
    for (const key of ["showLogos", "showCompanyNames", "showGapBars", "showMarketSummary", "reducedMotion"] as const) {
      if (typeof source[key] === "boolean") result[key] = source[key];
    }
    const choices = {
      density: ["comfortable", "compact"],
      compareRange: ["1D", "1W", "1M", "YTD", "1Y"],
      watchlistSort: ["original", "ticker", "price", "changePct", "vsBenchmarkPct"],
      sortDirection: ["ascending", "descending"],
      watchlistFilter: ["All stocks", "Ahead", "Behind"],
    };
    for (const key of Object.keys(choices) as (keyof typeof choices)[]) {
      if (typeof source[key] === "string" && choices[key].includes(source[key])) {
        Object.assign(result, { [key]: source[key] });
      }
    }
    return result;
  } catch {
    return defaultPreferences;
  }
}

/**
 * The first and second name's initials. A single name contributes only its own
 * first letter, and any name past the second is ignored. Splitting by code
 * point keeps accented letters whole.
 */
export function profileInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const firstLetter = (word: string) => Array.from(word)[0] ?? "";
  return (firstLetter(words[0]) + (words.length > 1 ? firstLetter(words[1]) : "")).toLocaleUpperCase();
}

/**
 * The name the avatar draws its initials from. The display name is this
 * browser's choice; without one, the signed-in account speaks for itself.
 */
export function profileName(displayName: string, account: { name: string | null; email: string }) {
  return displayName.trim() || account.name?.trim() || account.email;
}
