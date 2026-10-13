"use client";

import { useEffect, useSyncExternalStore } from "react";
import { defaultPreferences, parsePreferences, PREFERENCES_KEY, reconcilePreferences, type Preferences } from "@/lib/preferences";
import { createAccountCopy } from "@/lib/account-copy";

const copy = createAccountCopy<Preferences>({
  key: PREFERENCES_KEY,
  endpoint: "/api/preferences",
  ownerKey: "watchlist.preferences-owner.v1",
  parse: parsePreferences,
  reconcile: reconcilePreferences,
  empty: defaultPreferences,
});

export function usePreferences() {
  return useSyncExternalStore(copy.subscribe, copy.getSnapshot, copy.getServerSnapshot);
}

/** Mounted once in the (market) layout for the signed-in account. */
export function PreferencesSync({ userId }: { userId: string }) {
  useEffect(() => { void copy.start(userId); }, [userId]);
  return null;
}

/**
 * True once the account's preferences have loaded (or failed to), so forms
 * and saved choices don't start from this browser's defaults.
 */
export function usePreferencesReady() {
  return useSyncExternalStore(copy.subscribe, copy.isSynced, () => false);
}

export function savePreferences(patch: Partial<Preferences>): boolean {
  return copy.update(state => ({ ...state, ...patch }));
}

export function resetPreferences(): boolean {
  return copy.reset();
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
