import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountProvider } from "@/components/account-provider";
import { PreferencesProvider } from "@/components/preferences-provider";

export default async function MarketLayout({ children }: { children: React.ReactNode }) {
  // src/proxy.ts already redirects signed-out visitors; this is the check that guarantees it.
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return <AccountProvider account={{ email: session.user.email, name: session.user.name ?? null }}><PreferencesProvider>{children}</PreferencesProvider></AccountProvider>;
}
