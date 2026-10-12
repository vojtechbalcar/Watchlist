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
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="header-home" aria-label="Watchlist home">
          <Wordmark className="h-auto w-[122px]" />
        </Link>

        <nav
          className="header-nav"
          aria-label="Primary"
        >
          {navItems.map((item) => {
            const isActive = item.label === active;
            return (
              <NavLink
                key={item.label}
                href={item.href}
                active={isActive}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="header-utilities">
          <MarketAsOf className="header-asof" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
