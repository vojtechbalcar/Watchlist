import { PreferencesProvider } from "@/components/preferences-provider";

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <PreferencesProvider>{children}<footer className="site-footer"><span>Market snapshot &nbsp; / &nbsp; Aug 25, 15:58 ET</span><span>Demo data &nbsp; · &nbsp; Prices in USD</span></footer></PreferencesProvider>;
}
