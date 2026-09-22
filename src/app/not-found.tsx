import Link from "next/link";
import type { Metadata } from "next";
import { RecoveryScreen } from "@/components/recovery-screen";

export const metadata: Metadata = {
  title: "Page not found | Watchlist",
};

export default function NotFound() {
  return (
    <RecoveryScreen
      label="404 / Page not found"
      title="This page isn’t here."
      description="The link may be outdated, or the address may be incorrect. Find your way back to the stocks you follow."
    >
      <Link href="/">Go to dashboard</Link>
    </RecoveryScreen>
  );
}
