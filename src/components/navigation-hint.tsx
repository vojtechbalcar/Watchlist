"use client";

import { useLinkStatus } from "next/link";

export function NavigationHint() {
  const { pending } = useLinkStatus();
  return <span className={`navigation-hint${pending ? " is-pending" : ""}`} role="status">
    <span className="sr-only">{pending ? "Opening page…" : ""}</span>
  </span>;
}
