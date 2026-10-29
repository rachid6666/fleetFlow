import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { getShipmentByTrackingCode } from "@/lib/data";

const events = [{ status: "In transit", description: "Shipment is moving toward its destination.", time: "Today · 10:42" }, { status: "Dispatched", description: "Driver accepted the shipment from the origin hub.", time: "Today · 08:15" }, { status: "Shipment created", description: "Shipment information was received by FleetFlow.", time: "Yesterday · 16:20" }];

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const code = (await searchParams).code ?? "FF-2048-AL";
  const shipment = getShipmentByTrackingCode(code);
  return <div className="app-shell"><Sidebar /><main className="main simple-page"><div className="topbar"><div><div className="eyebrow">Customer tracking</div><h1>Where is your shipment?</h1><p className="subtitle">Enter a tracking code to see the latest verified events.</p></div></div><section className="panel"><form className="tracking-form"><input name="code" defaultValue={code} placeholder="e.g. FF-2048-AL" aria-label="Tracking code" /><button className="button">Track shipment</button></form>{shipment ? <><div className="panel-heading"><div><h2>{shipment.trackingCode}</h2><p className="subtitle">{shipment.origin} → {shipment.destination} · ETA {shipment.eta}</p></div><StatusBadge status={shipment.status} /></div><div className="timeline">{events.map((event) => <div className="timeline-item" key={event.status}><div className="timeline-rail" /><div><time>{event.time}</time><h3>{event.status}</h3><p>{event.description}</p></div></div>)}</div></> : <p className="subtitle">No shipment found for <strong>{code}</strong>. Check the code and try again.</p>}</section></main></div>;
}
