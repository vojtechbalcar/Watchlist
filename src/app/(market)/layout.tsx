import { PreferencesProvider } from "@/components/preferences-provider";

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <PreferencesProvider>{children}</PreferencesProvider>;
}
