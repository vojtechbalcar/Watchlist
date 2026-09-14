"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { navItems } from "@/lib/watchlist-data";

export function MarketHeader() {
  const path = usePathname();
  const active = navItems.find(item => item.href === "/" ? path === "/" : path.startsWith(item.href))?.label ?? "Settings";
  return <SiteHeader active={active} asOf="Demo · Aug 25, 15:58 ET" initials="JR" />;
}
