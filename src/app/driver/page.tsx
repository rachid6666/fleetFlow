import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { StatusActions } from "@/components/status-actions";
import { listShipmentsForDriver } from "@/lib/data";

export default async function DriverPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login?error=driver");

  const assigned = await listShipmentsForDriver(email);
  const name = session.user.name ?? "Driver";
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">Driver view · {name}</div>
            <h1>Your route today</h1>
            <p className="subtitle">Keep every handoff clear and every delivery auditable.</p>
          </div>
          <div className="avatar">{initials}</div>
        </div>
        <section className="panel mobile-card">
          <div className="panel-heading">
            <h2>{assigned.length} assigned shipments</h2>
            <span className="status-badge status-in_transit">On duty</span>
          </div>
          {assigned.map((shipment) => (
            <article className="driver-card" key={shipment.id}>
              <div>
                <h3>{shipment.trackingCode}</h3>
                <p>
                  {shipment.origin} → {shipment.destination}
                </p>
                <StatusBadge status={shipment.status} />
                <p>{shipment.notes ?? "No notes yet."}</p>
              </div>
              <div className="driver-actions">
                <StatusActions trackingCode={shipment.trackingCode} current={shipment.status} />
                <button className="button secondary">Add POD note</button>
              </div>
            </article>
          ))}
          {assigned.length === 0 ? <p>No shipments are assigned to your account.</p> : null}
        </section>
      </main>
    </div>
  );
}
