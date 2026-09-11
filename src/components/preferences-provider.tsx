"use client";

import { useSyncExternalStore } from "react";
import { defaultPreferences, parsePreferences, PREFERENCES_KEY, type Preferences } from "@/lib/preferences";

const changeEvent = "watchlist-preferences-change";
let cachedRaw: string | null | undefined;
let cachedPreferences = defaultPreferences;

function getSnapshot() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedPreferences = parsePreferences(raw);
    }
  } catch {
    // Storage may be blocked by browser privacy settings; rendering still works.
  }
  return cachedPreferences;
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERENCES_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, callback);
  };
}

export function usePreferences() {
  return useSyncExternalStore(subscribe, getSnapshot, () => defaultPreferences);
}

export function savePreferences(patch: Partial<Preferences>): boolean {
  try {
    const next = parsePreferences(JSON.stringify({ ...getSnapshot(), ...patch }));
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch {
    return false;
  }
}

export function resetPreferences(): boolean {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch {
    return false;
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const settings = usePreferences();
  return <div className="market-app" data-density={settings.density}
    data-show-logos={settings.showLogos} data-show-names={settings.showCompanyNames}
    data-show-gaps={settings.showGapBars} data-show-markets={settings.showMarketSummary}
    data-reduced-motion={settings.reducedMotion}>
    {children}
  </div>;
}
