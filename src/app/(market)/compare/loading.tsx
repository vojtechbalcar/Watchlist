import { SiteHeader } from "@/components/site-header";
import { CompareViewSkeleton } from "@/components/skeletons";

export default function CompareLoading() {
  return <>
    <SiteHeader active="Compare" />
    <main className="page-shell"><div><CompareViewSkeleton /></div></main>
  </>;
}
