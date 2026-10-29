import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { demoShipments } from "@/lib/data";

export default function ShipmentsPage() {
  return <div className="app-shell"><Sidebar /><main className="main"><div className="topbar"><div><div className="eyebrow">Admin · Shipments</div><h1>Shipment desk</h1><p className="subtitle">Assign, monitor, and resolve every shipment in one place.</p></div><button className="button">+ Create shipment</button></div><section className="panel"><table className="shipment-table"><thead><tr><th>Tracking code</th><th>Route</th><th>Status</th><th>Driver</th><th>Customer</th><th>ETA</th></tr></thead><tbody>{demoShipments.map((shipment) => <tr key={shipment.id}><td className="tracking-code">{shipment.trackingCode}</td><td>{shipment.origin} → {shipment.destination}</td><td><StatusBadge status={shipment.status} /></td><td>{shipment.driverName ?? "Unassigned"}</td><td>{shipment.customerName}</td><td>{shipment.eta}</td></tr>)}</tbody></table></section></main></div>;
}
