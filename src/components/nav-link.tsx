"use client";

import Link, { useLinkStatus } from "next/link";

/**
 * Next reports a link's pending state only from inside the link, so the label
 * carries the indicator. It is the only feedback available between the click
 * and the new route rendering its own skeleton.
 */
function PendingLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <span className="nav-label" data-pending={pending || undefined} aria-busy={pending || undefined}>{children}</span>;
}

export function NavLink({ href, active = false, className, children }: {
  href: string; active?: boolean; className?: string; children: React.ReactNode;
}) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={className}>
    <PendingLabel>{children}</PendingLabel>
  </Link>;
}
