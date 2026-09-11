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

export function profileInitials(name: string, fallback = "JR") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length ? (Array.from(words[0])[0] + (words.length > 1 ? Array.from(words[words.length - 1])[0] : "")).toLocaleUpperCase() : fallback;
}
