import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { CompareView } from "@/components/compare-view";
import { CompareViewSkeleton } from "@/components/skeletons";

export const metadata = {
  title: "Compare",
};

export default function ComparePage() {
  return (
    <>
      <SiteHeader active="Compare" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="page-shell">
        <div>
          <Suspense fallback={<CompareViewSkeleton />}><CompareView /></Suspense>
        </div>
      </main>
    </>
  );
}
