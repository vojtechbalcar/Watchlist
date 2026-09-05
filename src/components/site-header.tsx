import Link from "next/link";
import { Wordmark } from "./wordmark";
import { navItems } from "@/lib/watchlist-data";

type SiteHeaderProps = {
  active?: string;
  asOf: string;
  initials: string;
};

export function SiteHeader({ active = "Dashboard", asOf, initials }: SiteHeaderProps) {
  return (
    <header className="h-header border-b border-line">
      <div className="mx-auto flex h-full max-w-(--container-page) items-center gap-8 px-6 sm:px-8 xl:gap-12">
        <Link href="/" className="shrink-0">
          <Wordmark />
        </Link>

        <nav
          className="flex min-w-0 items-center gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          {navItems.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "relative shrink-0 py-1 text-lg transition-colors",
                  isActive
                    ? "font-bold text-ink"
                    : "font-medium text-text-muted hover:text-ink",
                ].join(" ")}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-[3px] bg-brand"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6">
          <span className="hidden text-lg font-medium text-text-muted md:inline">{asOf}</span>
          <span className="grid size-[41px] place-items-center rounded-full border border-line-avatar bg-surface-raised text-lg font-medium text-text-muted">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
