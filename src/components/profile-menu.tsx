"use client";

import Link from "next/link";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "./preferences-provider";
import { useAccount } from "./account-provider";
import { logout } from "@/app/(auth)/actions";
import { profileInitials, profileName } from "@/lib/preferences";

export function ProfileMenu() {
  const settings = usePreferences();
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return <div className="profile-menu" ref={wrapper} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <button ref={trigger} className="profile-trigger" aria-label="Profile menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <span className="profile-avatar">{profileInitials(profileName(settings.displayName, account))}</span>
      <ChevronDown size={12} aria-hidden="true" />
    </button>
    {open && <div className="profile-popover" id={id}>
      <div className="profile-identity"><strong>{profileName(settings.displayName, account)}</strong><span>{account.email}</span></div>
      <nav aria-label="Profile">
        <Link href="/settings" aria-current={pathname === "/settings" ? "page" : undefined} onClick={() => setOpen(false)}><Settings size={16} aria-hidden="true" />Settings<span aria-hidden="true">↗</span></Link>
        <form action={logout}><button type="submit"><LogOut size={16} aria-hidden="true" />Log out</button></form>
      </nav>
    </div>}
  </div>;
}
