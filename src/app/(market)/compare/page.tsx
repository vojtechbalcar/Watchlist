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
      <SiteHeader active="Compare" />

      <main className="page-shell">
        <div>
          <Suspense fallback={<CompareViewSkeleton />}><CompareView /></Suspense>
        </div>
      </main>
    </>
  );
}
