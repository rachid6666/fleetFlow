import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { workspacePathForRole } from "@/lib/roles";
import { DeliveryNoteForm } from "@/components/delivery-note-form";
import { DeliveryProofUpload } from "@/components/delivery-proof-upload";
import { AssignmentResponseActions } from "@/components/assignment-response-actions";
import { DriverAvailabilityControl } from "@/components/driver-availability-control";
import { Sidebar } from "@/components/sidebar";
import { StatusActions } from "@/components/status-actions";
import { StatusBadge } from "@/components/status-badge";
import { getDriverByEmail, listShipmentsForDriver } from "@/lib/data";
import { ShipmentFilterForm, ShipmentPagination } from "@/components/shipment-filters";
import { filterShipments, paginateShipments, parseShipmentFilters, type ShipmentSearchParams } from "@/lib/shipment-search";

export const dynamic = "force-dynamic";

export default async function DriverPage({ searchParams }: { searchParams: Promise<ShipmentSearchParams> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "DRIVER") redirect(workspacePathForRole(session.user.role));
  const email = session.user.email;
  if (!email) redirect("/login?error=email");

  const [assigned, driver] = await Promise.all([
    listShipmentsForDriver(email),
    getDriverByEmail(email),
  ]);
  const name = driver?.name ?? session.user.name ?? "Driver";
  const { filters, error } = parseShipmentFilters(await searchParams, true);
  const filtered = error ? [] : filterShipments(assigned, filters);
  const { page, pages, offset, visible } = paginateShipments(filtered, filters.page);
  const firstName = name.split(/\s+/)[0] || "Driver";
  const activeTrips = assigned.filter((shipment) => shipment.status !== "DELIVERED").length;
  const completedTrips = assigned.length - activeTrips;
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main driver-main">
        <div className="driver-mobile-shell">
          <section className="driver-hero">
            <div className="driver-hero-top">
              <div>
                <div className="driver-hero-eyebrow">Driver workspace</div>
                <p>Signed in as {name}</p>
              </div>
              <span className={`status-badge ${driver?.availability === "UNAVAILABLE" ? "status-pending" : "status-delivered"}`}>
                {driver?.availability === "UNAVAILABLE" ? "Unavailable" : "Available"}
              </span>
            </div>
            <div className="driver-availability-setting">
              <span><strong>Availability</strong><small>Let dispatch know whether you can take assignments.</small></span>
              <DriverAvailabilityControl current={driver?.availability ?? "AVAILABLE"} />
            </div>
            <div className="driver-hero-copy">
              <div>
                <h1>Good route, {firstName}.</h1>
                <p>Your assignments and next actions are ready below.</p>
              </div>
              <div className="avatar driver-hero-avatar">{initials}</div>
            </div>
            <div className="driver-hero-stats">
              <div><strong>{assigned.length}</strong><span>Assigned</span></div>
              <div><strong>{activeTrips}</strong><span>Active</span></div>
              <div><strong>{completedTrips}</strong><span>Completed</span></div>
            </div>
          </section>

          <section className="driver-workspace" aria-labelledby="driver-trips-title">
            <div className="driver-list-heading">
              <div>
                <div className="eyebrow">Today&apos;s work</div>
                <h2 id="driver-trips-title">Your trips</h2>
              </div>
              <span role="status">{filtered.length === 1 ? "1 matching assignment" : `${filtered.length} matching assignments`}</span>
            </div>

            <ShipmentFilterForm filters={filters} driver />
            {error ? <p role="alert">{error}</p> : null}

            <div className="driver-trip-list">
              {visible.map((shipment, index) => (
                <article className="driver-trip-card" key={shipment.id}>
                  <div className="driver-trip-heading">
                    <div>
                      <span className="driver-trip-index">Trip {String(offset + index + 1).padStart(2, "0")}</span>
                      <h3>{shipment.trackingCode}</h3>
                    </div>
                    <StatusBadge status={shipment.status} />
                  </div>

                  <div className="driver-route" aria-label={`Route from ${shipment.origin} to ${shipment.destination}`}>
                    <div className="driver-route-stop">
                      <span className="driver-route-dot origin" aria-hidden="true" />
                      <div><small>Pickup</small><strong>{shipment.origin}</strong></div>
                    </div>
                    <span className="driver-route-connector" aria-hidden="true" />
                    <div className="driver-route-stop">
                      <span className="driver-route-dot destination" aria-hidden="true" />
                      <div><small>Delivery</small><strong>{shipment.destination}</strong></div>
                    </div>
                  </div>

                  <div className="driver-trip-meta">
                    <span><strong>Customer</strong>{shipment.customerName}</span>
                    <span><strong>Last update</strong>{shipment.updatedAt}</span>
                  </div>

                  <p className="driver-trip-note">{shipment.notes ?? "No delivery notes yet."}</p>

                  {shipment.assignmentStatus === "PENDING" ? (
                    <div className="driver-assignment-pending">
                      <div>
                        <strong>New assignment</strong>
                        <p>Review the route and choose whether you can take it.</p>
                      </div>
                      <AssignmentResponseActions trackingCode={shipment.trackingCode} />
                    </div>
                  ) : (
                    <div className="driver-trip-actions">
                      <StatusActions trackingCode={shipment.trackingCode} current={shipment.status} />
                      <DeliveryNoteForm trackingCode={shipment.trackingCode} />
                      <DeliveryProofUpload trackingCode={shipment.trackingCode} proofs={shipment.deliveryProofs} />
                    </div>
                  )}
                </article>
              ))}

              {visible.length === 0 ? (
                <div className="driver-empty-state">
                  <span aria-hidden="true">✓</span>
                  <h3>{assigned.length ? "No trips match your filters" : "No trips assigned"}</h3>
                  <p>{assigned.length ? "Try a different search or clear the filters." : "New assignments will appear here as soon as dispatch assigns them to your account."}</p>
                </div>
              ) : null}
            </div>
            <ShipmentPagination filters={filters} page={page} pages={pages} driver />
          </section>
        </div>
      </main>
    </div>
  );
}
