import Link from "next/link";
import { auth } from "../../auth";
import { SidebarNavigation } from "./sidebar-navigation";
import { workspaceLabelForRole } from "@/lib/roles";

export async function Sidebar() {
  const session = await auth();
  const role = session?.user?.role ?? null;

  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <span className="brand-mark">F</span>
        <span>FleetFlow</span>
      </Link>
      <div className="workspace-label">{role ? workspaceLabelForRole(role) : "FLEETFLOW ACCESS"}</div>
      <SidebarNavigation role={role} />
      {session?.user ? (
        <a className="sidebar-logout" href="/api/auth/logout">
          <span className="logout-button">Sign out</span>
        </a>
      ) : null}
      <div className="sidebar-footer">
        <span className="online-dot" /> System operational
        <small>FleetFlow Network · v0.1</small>
      </div>
    </aside>
  );
}
