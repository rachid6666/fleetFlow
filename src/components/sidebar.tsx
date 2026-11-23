import Link from "next/link";
import { auth } from "../../auth";
import { SidebarNavigation } from "./sidebar-navigation";
import { workspaceLabelForRole } from "@/lib/roles";

export async function Sidebar() {
  const session = await auth();
  const role = session?.user?.role ?? null;
  const workspace = role ? workspaceLabelForRole(role) : "FleetFlow access";
  const initials = role === "ADMIN" ? "CEO" : role === "SALES" ? "SL" : role ? role.slice(0, 2) : "FF";

  return (
    <aside className="sidebar" aria-label="FleetFlow workspace">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="brand-copy">
          <strong>FleetFlow</strong>
          <small>Logistics operations</small>
        </span>
      </Link>

      <div className="workspace-card">
        <span className="workspace-card-avatar" aria-hidden="true">{initials}</span>
        <span>
          <small>Current workspace</small>
          <strong>{workspace}</strong>
        </span>
        <span className="workspace-card-status" aria-hidden="true" />
      </div>

      <span className="workspace-label">Navigation</span>
      <SidebarNavigation role={role} />

      <div className="sidebar-bottom">
        {session?.user ? (
          <a className="sidebar-logout" href="/api/auth/logout">
            <span className="logout-button">Sign out <span aria-hidden="true">↗</span></span>
          </a>
        ) : null}
        <div className="sidebar-footer">
          <span><span className="online-dot" /> System operational</span>
          <small>FleetFlow Network · v0.1</small>
        </div>
      </div>
    </aside>
  );
}
