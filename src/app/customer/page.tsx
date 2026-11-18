import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { listShipmentsForCustomer } from "@/lib/data";
import { workspacePathForRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CustomerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect(workspacePathForRole(session.user.role));
  if (!session.user.email) redirect("/login?error=email");

  const shipments = await listShipmentsForCustomer(session.user.email);
  const active = shipments.filter((shipment) => shipment.status !== "DELIVERED").length;
  const delivered = shipments.filter((shipment) => shipment.status === "DELIVERED").length;
  const exceptions = shipments.filter((shipment) => shipment.status === "EXCEPTION").length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main customer-main">
        <div className="topbar">
          <div>
            <div className="eyebrow">Customer portal</div>
            <h1>My shipments</h1>
            <p className="subtitle">Only shipments linked to your customer account are shown here.</p>
          </div>
          <div className="avatar">{shipments.length}</div>
        </div>

        <section className="metrics">
          <div className="metric-card">
            <div className="metric-label">Active shipments</div>
            <div className="metric-value">{active}</div>
            <div className="metric-note">Currently moving or awaiting dispatch</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Delivered</div>
            <div className="metric-value">{delivered}</div>
            <div className="metric-note">Completed shipments</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Exceptions</div>
            <div className="metric-value">{exceptions}</div>
            <div className="metric-note">Shipments requiring attention</div>
          </div>
        </section>

        {shipments.length ? (
          <section className="customer-shipment-grid" aria-label="Your shipments">
            {shipments.map((shipment) => (
              <article className="panel customer-shipment-card" key={shipment.id}>
                <div className="panel-heading">
                  <div>
                    <div className="eyebrow">{shipment.trackingCode}</div>
                    <h2>{shipment.origin} ? {shipment.destination}</h2>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
                <div className="customer-shipment-summary">
                  <span><strong>Estimated arrival</strong>{shipment.eta}</span>
                  <span><strong>Last update</strong>{shipment.updatedAt}</span>
                </div>
                <div className="timeline">
                  {shipment.events.map((event) => (
                    <div className="timeline-item" key={`${shipment.id}-${event.status}-${event.createdAt}`}>
                      <div className="timeline-rail" />
                      <div>
                        <time>{new Date(event.createdAt).toLocaleString()}</time>
                        <h3>{event.description}</h3>
                      </div>
                    </div>
                  ))}
                  {shipment.events.length === 0 ? <p className="subtitle">No tracking updates are available yet.</p> : null}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="panel driver-empty-state">
            <span aria-hidden="true">?</span>
            <h3>No shipments linked to your account</h3>
            <p>Contact FleetFlow support if you expected a shipment to appear here.</p>
          </section>
        )}
      </main>
    </div>
  );
}
