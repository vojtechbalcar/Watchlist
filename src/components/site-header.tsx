import Link from "next/link";
import { Wordmark } from "./wordmark";
import { navItems } from "@/lib/watchlist-data";
import { ProfileMenu } from "./profile-menu";
import { NavLink } from "./nav-link";
import { MarketAsOf } from "./market-as-of";

type SiteHeaderProps = {
  active?: string;
};

export function SiteHeader({ active = "Dashboard" }: SiteHeaderProps) {
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
              <NavLink
                key={item.label}
                href={item.href}
                active={isActive}
                className={[
                  "relative shrink-0 py-1 text-lg transition-colors",
                  isActive
                    ? "font-bold text-ink"
                    : "font-medium text-text-muted hover:text-ink",
                ].join(" ")}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6">
          <MarketAsOf className="hidden text-sm font-medium text-text-muted md:inline" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
