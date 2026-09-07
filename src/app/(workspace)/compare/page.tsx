import { SiteHeader } from "@/components/site-header";
import { CompareView } from "@/components/compare-view";

export const metadata = {
  title: "Compare | Watchlist",
};

export default function ComparePage() {
  return (
    <>
      <SiteHeader active="Compare" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="page-shell">
        <div>
          <CompareView initialRange="YTD" />
        </div>
      </main>
    </>
  );
}
