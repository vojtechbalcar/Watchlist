import { SettingsView } from "@/components/settings-view";
import "./settings.css";

export const metadata = {
  title: "Settings · Watchlist",
  description: "Make Watchlist work your way. Manage your profile and display preferences.",
};

export default function SettingsPage() {
  return <>
    <main className="page-shell settings-page"><SettingsView /></main>
  </>;
}
