import Link from "next/link";
import { auth, signOut } from "../../auth";
import { SidebarNavigation } from "./sidebar-navigation";

export async function Sidebar() {
  const session = await auth();

  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <span className="brand-mark">F</span>
        <span>FleetFlow</span>
      </Link>
      <div className="workspace-label">OPERATIONS CENTER</div>
      <SidebarNavigation />
      {session?.user ? (
        <form className="sidebar-logout" action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
          <button className="logout-button" type="submit">Sign out</button>
        </form>
      ) : null}
      <div className="sidebar-footer">
        <span className="online-dot" /> System operational
        <small>FleetFlow Network · v0.1</small>
      </div>
    </aside>
  );
}
