import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { StatusActions } from "@/components/status-actions";
import { demoShipments } from "@/lib/data";

export default function DriverPage() {
  const assigned = demoShipments.filter((shipment) => shipment.driverName === "Nadia Benali");
  return <div className="app-shell"><Sidebar /><main className="main"><div className="topbar"><div><div className="eyebrow">Driver view · Nadia Benali</div><h1>Your route today</h1><p className="subtitle">Keep every handoff clear and every delivery auditable.</p></div><div className="avatar">NB</div></div><section className="panel mobile-card"><div className="panel-heading"><h2>{assigned.length} assigned shipments</h2><span className="status-badge status-in_transit">On duty</span></div>{assigned.map((shipment) => <article className="driver-card" key={shipment.id}><div><h3>{shipment.trackingCode}</h3><p>{shipment.origin} → {shipment.destination}</p><StatusBadge status={shipment.status} /><p>{shipment.notes ?? "No notes yet."}</p></div><div className="driver-actions"><StatusActions trackingCode={shipment.trackingCode} current={shipment.status} /><button className="button secondary">Add POD note</button></div></article>)}</section></main></div>;
}
