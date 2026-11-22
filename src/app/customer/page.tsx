import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { getShipmentForCustomer } from "@/lib/data";
import { workspacePathForRole } from "@/lib/roles";
import { statusLabels, type CustomerShipment } from "@/lib/types";

export const dynamic = "force-dynamic";

type CustomerPageProps = {
  searchParams: Promise<{ tracking?: string | string[] }>;
};

export default async function CustomerPage({ searchParams }: CustomerPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect(workspacePathForRole(session.user.role));
  if (!session.user.email) redirect("/login?error=email");

  const params = await searchParams;
  const rawTrackingCode = Array.isArray(params.tracking) ? params.tracking[0] : params.tracking;
  const trackingCode = rawTrackingCode?.trim().toUpperCase() ?? "";
  const isTrackingView = trackingCode.length > 0;
  const isValidTrackingCode = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(trackingCode);

  const selectedShipment =
    isTrackingView && isValidTrackingCode
      ? await getShipmentForCustomer(session.user.email, trackingCode)
      : undefined;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main customer-main">
        <div className="topbar customer-topbar">
          <div>
            <div className="eyebrow">Customer portal</div>
            <h1>Track your shipment</h1>
            <p className="subtitle">Enter a tracking code assigned to your customer account.</p>
          </div>
        </div>

        <section className="panel customer-tracking-panel" aria-labelledby="customer-tracking-heading">
          <div className="customer-tracking-copy">
            <div className="eyebrow">Shipment lookup</div>
            <h2 id="customer-tracking-heading">Enter your tracking code</h2>
            <p>
              FleetFlow only shows shipments assigned to your signed-in customer account.
            </p>
          </div>

          <form className="customer-tracking-form" action="/customer" method="get">
            <label htmlFor="tracking-code">Tracking code</label>
            <div className="customer-tracking-input-row">
              <input
                id="tracking-code"
                name="tracking"
                type="search"
                defaultValue={trackingCode}
                placeholder="FF-LOCAL-001"
                autoComplete="off"
                maxLength={100}
                pattern="[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*"
                required
                spellCheck={false}
              />
              <button className="button" type="submit">Track shipment</button>
            </div>
            <small>Use the exact tracking code supplied by FleetFlow.</small>
          </form>
        </section>

        {isTrackingView ? (
          <section className="customer-tracking-result" aria-live="polite">
            <div className="customer-section-heading">
              <div>
                <div className="eyebrow">Tracking result</div>
                <h2>
                  {!isValidTrackingCode
                    ? "Invalid tracking code"
                    : selectedShipment
                      ? "Shipment located"
                      : "Shipment not found"}
                </h2>
                {isValidTrackingCode ? <p>Tracking code <strong>{trackingCode}</strong></p> : null}
              </div>
            </div>

            {!isValidTrackingCode ? (
              <div className="panel customer-tracking-not-found" role="alert">
                <span aria-hidden="true">!</span>
                <div>
                  <h3>Enter a valid tracking code</h3>
                  <p>Use letters, numbers, and hyphens only.</p>
                </div>
              </div>
            ) : selectedShipment ? (
              <CustomerShipmentCard shipment={selectedShipment} />
            ) : (
              <div className="panel customer-tracking-not-found">
                <span aria-hidden="true">?</span>
                <div>
                  <h3>This tracking code is not assigned to your account</h3>
                  <p>Check the code and try again.</p>
                </div>
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}

function CustomerShipmentCard({ shipment }: { shipment: CustomerShipment }) {
  return (
    <article className="panel customer-shipment-card is-featured">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">Tracking · {shipment.trackingCode}</div>
          <h2>{shipment.origin} → {shipment.destination}</h2>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="customer-shipment-summary">
        <span><strong>Estimated arrival</strong>{shipment.eta}</span>
        <span><strong>Last update</strong>{shipment.updatedAt}</span>
        <span><strong>Timeline events</strong>{shipment.events.length}</span>
      </div>

      <div className="customer-timeline-heading">
        <div>
          <div className="eyebrow">Shipment activity</div>
          <h3>Latest customer updates</h3>
        </div>
        <span>{shipment.events.length ? `${shipment.events.length} recorded` : "Awaiting updates"}</span>
      </div>

      {shipment.events.length ? (
        <div className="timeline customer-timeline">
          {shipment.events.map((event) => (
            <div className="timeline-item" key={`${shipment.id}-${event.status}-${event.createdAt}`}>
              <div className="timeline-rail" />
              <div className="customer-timeline-event">
                <div className="customer-event-meta">
                  <span className={`customer-event-status status-${event.status.toLowerCase()}`}>
                    {statusLabels[event.status]}
                  </span>
                  <time>{new Date(event.createdAt).toLocaleString()}</time>
                </div>
                <h3>{event.description}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="customer-timeline-empty">No tracking updates are available yet.</p>
      )}
    </article>
  );
}
