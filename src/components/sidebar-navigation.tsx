"use client";

import Link from "next/link";
import { useState } from "react";

export function SidebarNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

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
          {isOpen ? (
            <path d="m6 6 12 12M18 6 6 18" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>
      <nav
        id="main-navigation"
        className={`nav-list${isOpen ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <Link href="/" onClick={closeMenu}>Network home</Link>
        <Link href="/admin" onClick={closeMenu}>Overview</Link>
        <Link href="/admin/shipments" onClick={closeMenu}>Shipments</Link>
        <Link href="/driver" onClick={closeMenu}>Driver mobile view</Link>
        <Link href="/track" onClick={closeMenu}>Customer tracking</Link>
      </nav>
    </>
  );
}
