import { PreferencesProvider } from "@/components/preferences-provider";
import { MarketHeader } from "@/components/market-header";

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <PreferencesProvider><MarketHeader />{children}<footer className="site-footer"><span>Illustrative snapshot &nbsp; / &nbsp; Aug 25, 15:58 ET</span><span>Demo data &nbsp; · &nbsp; Prices in USD</span></footer></PreferencesProvider>;
}
