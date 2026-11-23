"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AppRole } from "@/lib/roles";

type NavigationIconName = "overview" | "analytics" | "copilot" | "shipments" | "payments" | "drivers";

const roleLinks: Record<AppRole, Array<{ href: Route; label: string; icon: NavigationIconName }>> = {
  ADMIN: [
    { href: "/admin" as Route, label: "Overview", icon: "overview" },
    { href: "/admin/analytics" as Route, label: "Analytics", icon: "analytics" },
    { href: "/admin/shipments" as Route, label: "Shipments", icon: "shipments" },
    { href: "/admin/payments" as Route, label: "Payments", icon: "payments" },
    { href: "/admin/drivers" as Route, label: "Driver group", icon: "drivers" },
    { href: "/admin/copilot" as Route, label: "AI copilot", icon: "copilot" },
  ],
  SALES: [
    { href: "/sales" as Route, label: "Sales dashboard", icon: "analytics" },
  ],
  DRIVER: [
    { href: "/driver" as Route, label: "My trips", icon: "shipments" },
  ],
  CUSTOMER: [
    { href: "/customer" as Route, label: "My shipments", icon: "shipments" },
  ],
};

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "analytics") {
    return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg>;
  }
  if (name === "copilot") {
    return <svg {...common}><path d="M8 9h8M8 13h5M6 3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-6l-5 3v-3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" /></svg>;
  }
  if (name === "shipments") {
    return <svg {...common}><path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5ZM3 7.5V16l9 5 9-5V7.5M12 12v9" /></svg>;
  }
  if (name === "payments") {
    return <svg {...common}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 9h19M6 15h4" /></svg>;
  }
  if (name === "drivers") {
    return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  }
  return <svg {...common}><path d="M4 13h6V4H4v9ZM14 20h6v-9h-6v9ZM4 20h6v-3H4v3ZM14 7h6V4h-6v3Z" /></svg>;
}

export function SidebarNavigation({ role }: { role: AppRole | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const links = role ? roleLinks[role] : [];

  const closeMenu = () => setIsOpen(false);
  const isActive = (href: Route) => href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      window.requestAnimationFrame(() => toggleRef.current?.focus());
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      <button
        ref={toggleRef}
        className="sidebar-toggle"
        type="button"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <nav id="main-navigation" className={`nav-list${isOpen ? " is-open" : ""}`} aria-label="Main navigation">
        {role ? null : <Link href="/login" onClick={closeMenu}><span className="nav-icon"><NavigationIcon name="overview" /></span><span>Sign in</span></Link>}
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              href={link.href}
              onClick={closeMenu}
              key={link.href}
              className={active ? "is-active" : undefined}
              aria-current={active ? "page" : undefined}
            >
              <span className="nav-icon"><NavigationIcon name={link.icon} /></span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
