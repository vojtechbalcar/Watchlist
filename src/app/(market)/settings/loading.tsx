import { SiteHeader } from "@/components/site-header";
import { SettingsViewSkeleton } from "@/components/skeletons";
import "./settings.css";

export default function SettingsLoading() {
  return <>
    <SiteHeader active="Settings" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <main className="page-shell settings-page"><SettingsViewSkeleton /></main>
  </>;
}
