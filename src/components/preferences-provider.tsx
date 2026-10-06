"use client";

import { useEffect, useSyncExternalStore } from "react";
import { defaultPreferences, parsePreferences, PREFERENCES_KEY, reconcilePreferences, type Preferences } from "@/lib/preferences";
import { createAccountSync } from "./account-sync";

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

/** Preferences follow the account like the watchlist; see createAccountSync. */
const sync = createAccountSync<Preferences>({
  endpoint: "/api/preferences",
  ownerKey: "watchlist.preferences-owner.v1",
  read: getSnapshot,
  replace(preferences) {
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch { /* Blocked storage. */ }
    window.dispatchEvent(new Event(changeEvent));
  },
  reconcile: reconcilePreferences,
  empty: defaultPreferences,
});

/** Mounted once in the (market) layout for the signed-in account. */
export function PreferencesSync({ userId }: { userId: string }) {
  useEffect(() => { void sync.start(userId); }, [userId]);
  return null;
}

/**
 * True once the account's preferences have loaded (or failed to), so forms
 * and saved choices don't start from this browser's defaults.
 */
export function usePreferencesReady() {
  return useSyncExternalStore(sync.subscribe, sync.isSynced, () => false);
}

export function savePreferences(patch: Partial<Preferences>): boolean {
  try {
    const next = parsePreferences(JSON.stringify({ ...getSnapshot(), ...patch }));
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
    sync.changed();
    return true;
  } catch {
    return false;
  }
}

export function resetPreferences(): boolean {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
    window.dispatchEvent(new Event(changeEvent));
    sync.changed();
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
