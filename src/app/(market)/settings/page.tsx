import { SiteHeader } from "@/components/site-header";
import { SettingsView } from "@/components/settings-view";
import "./settings.css";

export const metadata = {
  title: "Settings · Watchlist",
  description: "Make Watchlist work your way. Manage your profile and display preferences.",
};

export default function SettingsPage() {
  return <>
    <SiteHeader active="Settings" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <main className="page-shell settings-page"><SettingsView /></main>
  </>;
}
