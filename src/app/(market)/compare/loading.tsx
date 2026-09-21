import { SiteHeader } from "@/components/site-header";
import { CompareViewSkeleton } from "@/components/skeletons";

export default function CompareLoading() {
  return <>
    <SiteHeader active="Compare" asOf="Aug 25 · 15:58 ET" initials="JR" />
    <main className="page-shell"><div><CompareViewSkeleton /></div></main>
  </>;
}
