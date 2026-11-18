"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import type { AppRole } from "@/lib/roles";
import { workspacePathForRole } from "@/lib/roles";

const roleLinks: Record<AppRole, Array<{ href: Route; label: string }>> = {
  ADMIN: [
    { href: "/admin" as Route, label: "Overview" },
    { href: "/admin/analytics" as Route, label: "Analytics" },
    { href: "/admin/copilot" as Route, label: "AI copilot" },
    { href: "/admin/shipments" as Route, label: "Shipments" },
    { href: "/admin/drivers" as Route, label: "Drivers group" },
  ],
  DRIVER: [
    { href: "/driver" as Route, label: "My trips" },
  ],
  CUSTOMER: [
    { href: "/customer" as Route, label: "My shipments" },
  ],
};

export function SidebarNavigation({ role }: { role: AppRole | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const home = role ? workspacePathForRole(role) : "/login";
  const links = role ? roleLinks[role] : [];

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>
      <nav id="main-navigation" className={`nav-list${isOpen ? " is-open" : ""}`} aria-label="Main navigation">
        <Link href={home} onClick={closeMenu}>{role ? "Workspace home" : "Sign in"}</Link>
        {links.map((link) => <Link href={link.href} onClick={closeMenu} key={link.href}>{link.label}</Link>)}
      </nav>
    </>
  );
}
