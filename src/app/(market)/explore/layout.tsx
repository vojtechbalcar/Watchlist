import { ExplorePeriodProvider } from "@/components/explore-period-provider";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <ExplorePeriodProvider>{children}</ExplorePeriodProvider>;
}
