import { CompareView } from "@/components/compare-view";

export const metadata = {
  title: "Compare",
};

export default function ComparePage() {
  return (
    <>

      <main className="page-shell">
        <div>
          <CompareView />
        </div>
      </main>
    </>
  );
}
