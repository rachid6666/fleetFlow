import Link from "next/link";
import { SupersetNetworkMap } from "@/components/superset-network-map";
import { activeBranches } from "@/lib/branches";

export default function HomePage() {
  return (
    <main className="main simple-page" style={{ margin: "0 auto" }}>
      <div className="topbar"><div><div className="eyebrow">FleetFlow logistics network</div><h1>Move every shipment forward.</h1><p className="subtitle">A connected operations platform for dependable regional delivery.</p></div><div className="page-actions"><Link className="button secondary" href="/login">Sign in</Link><div className="avatar">FF</div></div></div>
      <div className="content-grid">
        <section className="panel"><div className="panel-heading"><h2>Choose a workspace</h2></div><div className="activity-list">
          <Link className="driver-card" href="/admin"><div><h3>Admin operations</h3><p>Monitor shipments, metrics, assignments, and exceptions.</p></div><span className="button">Open</span></Link>
          <Link className="driver-card" href="/driver"><div><h3>Driver mobile view</h3><p>Update assigned shipments and capture delivery notes.</p></div><span className="button">Open</span></Link>
          <Link className="driver-card" href="/track"><div><h3>Customer tracking</h3><p>Look up a shipment and follow its status timeline.</p></div><span className="button">Open</span></Link>
        </div></section>
        <section className="panel"><div className="panel-heading"><h2>Why FleetFlow</h2></div><p className="subtitle">FleetFlow gives regional logistics teams one source of truth for shipment movement, driver handoffs, proof of delivery, and exceptions. Every update is designed to be visible, accountable, and actionable.</p><div className="company-facts"><div><strong>99.2%</strong><span>on-time handoffs</span></div><div><strong>24/7</strong><span>operational visibility</span></div><div><strong>5</strong><span>active branches</span></div></div></section>
      </div>
      <section className="panel network-panel"><div className="panel-heading"><div><h2>Our operating network</h2><p className="subtitle">Active FleetFlow branches coordinate cross-border and regional delivery flows.</p></div><span className="status-badge status-delivered">Network online</span></div><SupersetNetworkMap /><div className="branch-grid">{activeBranches.map((branch) => <div className="branch-card" key={branch.code}><span className="branch-code">{branch.code}</span><div><strong>{branch.name}</strong><small>{branch.city}, {branch.country} · {branch.volume}</small></div></div>)}</div></section>
    </main>
  );
}
