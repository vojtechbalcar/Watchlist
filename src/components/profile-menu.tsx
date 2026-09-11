"use client";

import Link from "next/link";
import { ChevronDown, Settings, LogIn } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "./preferences-provider";
import { profileInitials } from "@/lib/preferences";

export function ProfileMenu({ initials }: { initials: string }) {
  const settings = usePreferences();
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
      <span className="profile-avatar">{profileInitials(settings.displayName, initials)}</span>
      <ChevronDown size={12} aria-hidden="true" />
    </button>
    {open && <div className="profile-popover" id={id}>
      <div className="profile-identity"><strong>{settings.displayName || "Demo profile"}</strong><span>Preferences on this browser</span></div>
      <nav aria-label="Profile">
        <Link href="/settings" aria-current={pathname === "/settings" ? "page" : undefined} onClick={() => setOpen(false)}><Settings size={16} aria-hidden="true" />Settings<span aria-hidden="true">↗</span></Link>
        <Link href="/login" onClick={() => setOpen(false)}><LogIn size={16} aria-hidden="true" />Log in</Link>
      </nav>
    </div>}
  </div>;
}
