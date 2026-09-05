import { SiteHeader } from "@/components/site-header";
import { CompareView } from "@/components/compare-view";

export const metadata = {
  title: "Compare",
};

export default function ComparePage() {
  return (
    <>
      <SiteHeader active="Compare" asOf="Aug 25 · 15:58 ET" initials="JR" />

      <main className="mx-auto w-full max-w-(--container-page) px-6 pb-24 sm:px-8">
        <div className="mt-14">
          <CompareView initialRange="YTD" />
        </div>
      </main>
    </>
  );
}
