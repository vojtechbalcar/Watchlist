import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountProvider } from "@/components/account-provider";
import { MarketProvider } from "@/components/market-provider";
import { PreferencesProvider } from "@/components/preferences-provider";
import { WatchlistSync } from "@/components/watchlist-store";
import { getDb } from "@/lib/db";
import { readMarket } from "@/lib/market-build";

export default async function MarketLayout({ children }: { children: React.ReactNode }) {
  // src/proxy.ts already redirects signed-out visitors; this is the check that guarantees it.
  const session = await auth();
  if (!session?.user?.email || !session.user.id) redirect("/login");
  // One stored row (~10 KB) the price job keeps current; every page's prices and returns come from it.
  const market = await readMarket(getDb());

  return <AccountProvider account={{ email: session.user.email, name: session.user.name ?? null }}><MarketProvider snapshot={market}><PreferencesProvider><WatchlistSync userId={session.user.id} />{children}</PreferencesProvider></MarketProvider></AccountProvider>;
}
