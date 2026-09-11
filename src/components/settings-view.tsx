"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowDownToLine, ArrowUpRight, Check, ChevronRight, Monitor, SlidersHorizontal, UserRound, Database } from "lucide-react";
import { profileInitials, type Preferences } from "@/lib/preferences";
import { resetPreferences, savePreferences, usePreferences } from "./preferences-provider";

function SettingRow({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <div className="setting-row"><div className="setting-copy"><span className="setting-label" id={`${id}-label`}>{title}</span><p id={`${id}-hint`}>{description}</p></div><div className="setting-control">{children}</div></div>;
}

function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className="setting-switch" id={id} role="switch" aria-checked={checked} aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} onClick={() => onChange(!checked)}><span>{checked && <Check size={11} strokeWidth={2.5} aria-hidden="true" />}</span></button>;
}

function SelectSetting({ id, title, description, value, options, disabled, onChange }: {
  id: string; title: string; description: string; value: string; options: readonly (readonly [string, string])[]; disabled?: boolean; onChange: (value: string) => void;
}) {
  return <SettingRow id={id} title={title} description={description}><select id={id} value={value} disabled={disabled} aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} onChange={event => onChange(event.target.value)}>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></SettingRow>;
}

const sections = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Monitor },
  { id: "defaults", label: "Watchlist & comparison", icon: SlidersHorizontal },
  { id: "data", label: "Data & preferences", icon: Database },
];

export function SettingsView() {
  const preferences = usePreferences();
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function report(success: boolean, message = "Saved in this browser.") {
    setFailed(!success);
    setStatus(success ? message : "Your browser blocked saving. Allow site storage and try again.");
  }
  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    report(savePreferences({ [key]: value }));
  }
  function exportSettings() {
    try {
      const data = JSON.stringify({ version: 1, preferences }, null, 2);
      const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "watchlist-settings.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      report(true, "Settings export downloaded.");
    } catch {
      setFailed(true);
      setStatus("The export could not be downloaded. Please try again.");
    }
  }

  return <>
    <div className="page-heading settings-heading"><div><p className="eyebrow">A little more you</p><h1 className="page-title">Settings</h1><p className="settings-intro">Your view of the market. Your preferences.</p></div><span className="settings-storage"><Monitor size={14} aria-hidden="true" />Saved on this browser</span></div>
    <div className="settings-layout">
      <aside className="settings-sidebar"><nav aria-label="Settings sections">{sections.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`}><Icon size={16} aria-hidden="true" /><span>{label}</span><ChevronRight size={12} aria-hidden="true" /></a>)}</nav><p>Small adjustments.<br />A clearer perspective.</p></aside>
      <div className="settings-content">
        <section className="settings-section" id="profile" aria-labelledby="profile-heading">
          <div className="settings-section-heading"><span>01</span><div><h2 id="profile-heading">Profile</h2><p>A familiar face in your corner of Watchlist.</p></div></div>
          <form className="settings-profile" key={preferences.displayName} onSubmit={event => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("displayName") || "").trim();
            update("displayName", name);
          }}>
            <span className="profile-avatar settings-avatar" aria-hidden="true">{profileInitials(preferences.displayName)}</span>
            <div className="settings-name"><label htmlFor="display-name">Display name</label><div><input id="display-name" name="displayName" autoComplete="nickname" maxLength={60} defaultValue={preferences.displayName} placeholder="Your name" aria-describedby="display-name-hint" /><button type="submit" className="settings-button">Save name</button></div><p id="display-name-hint">Used for your profile initials. Visible only in this browser.</p></div>
          </form>
          <div className="settings-account"><div><strong>You’re exploring the demo</strong><p>Accounts aren’t connected yet. Email, password, two-factor authentication, and account deletion will be available when accounts launch.</p></div><Link href="/login">Account preview <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
        </section>

        <section className="settings-section" id="appearance" aria-labelledby="appearance-heading">
          <div className="settings-section-heading"><span>02</span><div><h2 id="appearance-heading">Appearance</h2><p>Keep the details that matter. Give the rest some space.</p></div></div>
          <SelectSetting id="density" title="Table density" description="Choose the spacing between stock rows across the app." value={preferences.density} options={[["comfortable", "Comfortable"], ["compact", "Compact"]]} onChange={value => update("density", value as Preferences["density"])} />
          <SettingRow id="logos" title="Company logos" description="Show company icons alongside stock symbols."><Toggle id="logos" checked={preferences.showLogos} onChange={value => update("showLogos", value)} /></SettingRow>
          <SettingRow id="company-names" title="Company names" description="Show full company names below symbols in stock tables."><Toggle id="company-names" checked={preferences.showCompanyNames} onChange={value => update("showCompanyNames", value)} /></SettingRow>
          <SettingRow id="gap-bars" title="Benchmark gap bars" description="Show visual lead and lag indicators in your watchlist."><Toggle id="gap-bars" checked={preferences.showGapBars} onChange={value => update("showGapBars", value)} /></SettingRow>
          <SettingRow id="market-summary" title="Market summary" description="Show the index snapshot at the top of Dashboard."><Toggle id="market-summary" checked={preferences.showMarketSummary} onChange={value => update("showMarketSummary", value)} /></SettingRow>
          <SettingRow id="reduced-motion" title="Reduce motion" description="Minimize animations and transitions. Your device’s reduced-motion preference is always respected."><Toggle id="reduced-motion" checked={preferences.reducedMotion} onChange={value => update("reducedMotion", value)} /></SettingRow>
        </section>

        <section className="settings-section" id="defaults" aria-labelledby="defaults-heading">
          <div className="settings-section-heading"><span>03</span><div><h2 id="defaults-heading">Watchlist & comparison</h2><p>Start with the perspective you reach for most.</p></div></div>
          <SelectSetting id="compare-range" title="Comparison period" description="The starting time range when you open Compare." value={preferences.compareRange} options={[["1D", "1 day"], ["1W", "1 week"], ["1M", "1 month"], ["YTD", "Year to date"], ["1Y", "1 year"]]} onChange={value => update("compareRange", value as Preferences["compareRange"])} />
          <SelectSetting id="watchlist-filter" title="Default stock filter" description="Start Dashboard and Watchlist with all stocks, or only those ahead or behind." value={preferences.watchlistFilter} options={[["All stocks", "All stocks"], ["Ahead", "Ahead of benchmark"], ["Behind", "Behind benchmark"]]} onChange={value => update("watchlistFilter", value as Preferences["watchlistFilter"])} />
          <SelectSetting id="watchlist-sort" title="Default sort" description="How stocks are ordered when you open your watchlist." value={preferences.watchlistSort} options={[["original", "Original order"], ["ticker", "Company symbol"], ["price", "Last price"], ["changePct", "Day change"], ["vsBenchmarkPct", "Benchmark difference"]]} onChange={value => update("watchlistSort", value as Preferences["watchlistSort"])} />
          <SelectSetting id="sort-direction" title="Sort direction" description={preferences.watchlistSort === "original" ? "Choose a sort above to set its direction." : "Ascending shows A–Z or lowest first; descending shows highest first."} value={preferences.sortDirection} disabled={preferences.watchlistSort === "original"} options={[["ascending", "Ascending"], ["descending", "Descending"]]} onChange={value => update("sortDirection", value as Preferences["sortDirection"])} />
          <div className="settings-note"><strong>About the benchmark</strong><p>Dashboard, Watchlist, and Compare use the S&P 500. Explore uses sector benchmarks. Prices are shown in USD; additional benchmarks and currencies need supported market data.</p></div>
        </section>

        <section className="settings-section" id="data" aria-labelledby="data-heading">
          <div className="settings-section-heading"><span>04</span><div><h2 id="data-heading">Data & preferences</h2><p>A fresh start, or a copy to keep.</p></div></div>
          <SettingRow id="export-settings" title="Export settings" description="Download your display name and preferences as a JSON file."><button id="export-settings" className="settings-button" onClick={exportSettings}><ArrowDownToLine size={14} aria-hidden="true" />Export settings</button></SettingRow>
          <SettingRow id="reset-settings" title="Reset preferences" description="Restore the defaults and clear your local display name."><button id="reset-settings" className="settings-button" aria-expanded={confirmReset} aria-controls="reset-confirmation" onClick={() => setConfirmReset(!confirmReset)}>Reset to defaults</button></SettingRow>
          {confirmReset && <div className="settings-reset" id="reset-confirmation"><div><strong>Reset your settings?</strong><p>Your display name will be cleared and all preferences restored. This does not change stock selections.</p></div><div><button className="settings-button" onClick={() => setConfirmReset(false)}>Keep settings</button><button className="primary-action" onClick={() => {
            const success = resetPreferences();
            report(success, "Default settings restored.");
            if (success) setConfirmReset(false);
          }}>Reset preferences</button></div></div>}
          <div className="settings-note"><strong>Local to this browser</strong><p>Preferences stay on this device and aren’t synced to an account. Clearing site data resets them. Market figures are illustrative demo data; price alerts and email notifications aren’t available yet.</p></div>
        </section>
        <div className="settings-endnote"><span>Display preferences save automatically.</span><Link href="/watchlist">Back to your watchlist <ArrowUpRight size={13} aria-hidden="true" /></Link></div>
      </div>
    </div>
    <div className={`settings-feedback${status ? " is-visible" : ""}${failed ? " is-error" : ""}`} role="status" aria-live="polite" aria-atomic="true">{status && <>{!failed && <Check size={15} aria-hidden="true" />}<span>{status}</span><button aria-label="Dismiss message" onClick={() => setStatus("")}>×</button></>}</div>
  </>;
}
