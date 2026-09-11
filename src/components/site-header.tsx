import Link from "next/link";
import { Wordmark } from "./wordmark";
import { navItems } from "@/lib/watchlist-data";
import { ProfileMenu } from "./profile-menu";

type SiteHeaderProps = {
  active?: string;
  asOf: string;
  initials: string;
};

export function SiteHeader({ active = "Dashboard", asOf, initials }: SiteHeaderProps) {
  return (
    <header className="site-header border-b border-line bg-surface-raised">
      <div className="header-inner mx-auto flex max-w-(--container-page) items-center gap-8 px-5 sm:px-8 xl:gap-12">
        <Link href="/" className="shrink-0">
          <Wordmark className="h-auto w-[122px]" />
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
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6">
          <span className="hidden text-sm font-medium text-text-muted md:inline">{asOf}</span>
          <Link href="/login" className="text-xs text-text-secondary hover:text-brand">Log in</Link>
          <ProfileMenu initials={initials} />
        </div>
      </div>
    </header>
  );
}
