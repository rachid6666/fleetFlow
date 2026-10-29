import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <span className="brand-mark">F</span>
        <span>FleetFlow</span>
      </Link>
      <div className="workspace-label">OPERATIONS CENTER</div>
      <nav className="nav-list" aria-label="Main navigation">
        <Link href="/">Network home</Link>
        <Link href="/admin">Overview</Link>
        <Link href="/admin/shipments">Shipments</Link>
        <Link href="/driver">Driver mobile view</Link>
        <Link href="/track">Customer tracking</Link>
      </nav>
      <div className="sidebar-footer">
        <span className="online-dot" /> System operational
        <small>FleetFlow Network · v0.1</small>
      </div>
    </aside>
  );
}
