import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { Sidebar } from "@/components/sidebar";
import { ShipmentFilterForm, ShipmentPagination } from "@/components/shipment-filters";
import { StatusBadge } from "@/components/status-badge";
import { getShipmentForCustomer, listShipmentsForCustomer } from "@/lib/data";
import { workspacePathForRole } from "@/lib/roles";
import {
  filterShipments,
  paginateShipments,
  parseShipmentFilters,
  shipmentSearchParams,
  type ShipmentSearchParams,
} from "@/lib/shipment-search";
import { statusLabels, type CustomerShipment } from "@/lib/types";

export const dynamic = "force-dynamic";

type CustomerPageProps = {
  searchParams: Promise<ShipmentSearchParams>;
};

export default async function CustomerPage({ searchParams }: CustomerPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect(workspacePathForRole(session.user.role));
  if (!session.user.email) redirect("/login?error=email");

  const params = await searchParams;
  const requestedTrackingCode = Array.isArray(params.tracking) ? params.tracking[0] : params.tracking;
  const trackingCode = requestedTrackingCode?.trim().toUpperCase() ?? "";
  const isTrackingView = trackingCode.length > 0;

  const [shipments, selectedShipment] = await Promise.all([
    listShipmentsForCustomer(session.user.email),
    isTrackingView
      ? getShipmentForCustomer(session.user.email, trackingCode)
      : Promise.resolve(undefined),
  ]);
  const { filters, error } = parseShipmentFilters(params);
  const filteredShipments = error ? [] : filterShipments(shipments, filters);
  const { page, pages, visible } = paginateShipments(filteredShipments, filters.page);

  const active = shipments.filter((shipment) => shipment.status !== "DELIVERED").length;
  const delivered = shipments.filter((shipment) => shipment.status === "DELIVERED").length;
  const exceptions = shipments.filter((shipment) => shipment.status === "EXCEPTION").length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main customer-main">
        <div className="topbar customer-topbar">
          <div>
            <div className="eyebrow">Customer portal</div>
            <h1>My shipments</h1>
            <p className="subtitle">Track only the shipments assigned to your authenticated customer account.</p>
          </div>
          <div className="customer-account-chip">
            <span>Assigned to you</span>
            <strong>{shipments.length.toString().padStart(2, "0")} shipments</strong>
          </div>
        </div>

        <section className="panel customer-tracking-panel" aria-labelledby="customer-tracking-heading">
          <div className="customer-tracking-copy">
            <div className="eyebrow">Assigned tracking</div>
            <h2 id="customer-tracking-heading">Open a shipment with its tracking code</h2>
            <p>
              Enter the tracking code FleetFlow assigned to this customer. Shipments belonging to another
              customer cannot be opened from this page.
            </p>
            <div className="customer-privacy-note">
              <span className="online-dot" aria-hidden="true" />
              Results are filtered by your signed-in customer account on the server.
            </div>
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
                pattern="[A-Za-z0-9-]+"
                required
                spellCheck={false}
              />
              <button className="button" type="submit">Track shipment</button>
            </div>
            <small>Use the exact code supplied by FleetFlow, for example <code>FF-LOCAL-001</code>.</small>
          </form>
        </section>

        <section className="metrics customer-metrics" aria-label="Shipment summary">
          <div className="metric-card">
            <div className="metric-label">Assigned shipments</div>
            <div className="metric-value">{shipments.length}</div>
            <div className="metric-note">Linked to your customer account</div>
          </div>
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

        {isTrackingView ? (
          <section className="customer-tracking-result" aria-live="polite">
            <div className="customer-section-heading">
              <div>
                <div className="eyebrow">Tracking result</div>
                <h2>{selectedShipment ? "Shipment located" : "No assigned shipment found"}</h2>
                <p>Tracking code <strong>{trackingCode}</strong></p>
              </div>
              <Link className="button secondary" href="/customer">View all my shipments</Link>
            </div>

            {selectedShipment ? (
              <CustomerShipmentCard shipment={selectedShipment} featured />
            ) : (
              <div className="panel customer-tracking-not-found">
                <span aria-hidden="true">?</span>
                <div>
                  <h3>This tracking code is not assigned to your account</h3>
                  <p>
                    Check the code and try again. For privacy, FleetFlow does not reveal whether a
                    tracking code belongs to another customer.
                  </p>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="customer-shipment-section" aria-labelledby="assigned-shipments-heading">
            <div className="customer-section-heading">
              <div>
                <div className="eyebrow">Your assigned shipments</div>
                <h2 id="assigned-shipments-heading">Shipment activity</h2>
                <p>Search, filter, or open an assigned tracking code for its customer-safe timeline.</p>
              </div>
              <span className="customer-count-pill">{shipments.length} assigned</span>
            </div>

            <ShipmentFilterForm filters={filters} />
            {error ? <p role="alert">{error}</p> : null}
            <div className="shipment-results-heading">
              <p role="status">{filteredShipments.length} matching shipments</p>
              {!error && filteredShipments.length > 0 ? (
                <a className="button secondary" href={`/api/customer/shipments/export?${shipmentSearchParams(filters)}`}>
                  Export matching shipments (CSV)
                </a>
              ) : null}
            </div>

            {visible.length ? (
              <div className="customer-shipment-grid">
                {visible.map((shipment) => (
                  <CustomerShipmentCard shipment={shipment} key={shipment.id} />
                ))}
              </div>
            ) : (
              <div className="panel driver-empty-state customer-empty-state">
                <span aria-hidden="true">FF</span>
                <h3>{shipments.length ? "No shipments match your filters" : "No shipments linked to your account"}</h3>
                <p>
                  {shipments.length
                    ? "Try a different search or clear the filters."
                    : "Contact FleetFlow support if you expected a shipment to appear here."}
                </p>
              </div>
            )}

            <ShipmentPagination filters={filters} page={page} pages={pages} />
          </section>
        )}
      </main>
    </div>
  );
}

function CustomerShipmentCard({
  shipment,
  featured = false,
}: {
  shipment: CustomerShipment;
  featured?: boolean;
}) {
  return (
    <article className={`panel customer-shipment-card${featured ? " is-featured" : ""}`}>
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

      <div className="customer-card-footer">
        <span>Only customer-safe shipment information is displayed.</span>
        {featured ? null : (
          <Link href={`/customer?tracking=${encodeURIComponent(shipment.trackingCode)}`}>
            Open tracking →
          </Link>
        )}
      </div>
    </article>
  );
}
