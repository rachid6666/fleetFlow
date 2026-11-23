import { PageHeader, PanelHeading, TableFrame } from "@/components/admin-ui";
import { CreateShipmentButton } from "@/components/create-shipment-button";
import { DriverAssignment } from "@/components/driver-assignment";
import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { getShipmentFormOptions, listShipments } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  const [shipments, shipmentOptions] = await Promise.all([listShipments(), getShipmentFormOptions()]);
  const inTransit = shipments.filter((shipment) => shipment.status === "IN_TRANSIT").length;
  const delivered = shipments.filter((shipment) => shipment.status === "DELIVERED").length;
  const exceptions = shipments.filter((shipment) => shipment.status === "EXCEPTION").length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main admin-page shipments-page">
        <PageHeader
          eyebrow="CEO panel · Shipments"
          title="Shipment desk"
          description="Assign drivers, monitor routes, and resolve exceptions from one operational table."
          actions={<CreateShipmentButton options={shipmentOptions} />}
          account={<span aria-label={`${shipments.length} shipments`}>{shipments.length}</span>}
        />

        <section className="summary-strip" aria-label="Shipment status summary">
          <div><span>All shipments</span><strong>{shipments.length}</strong></div>
          <div><span>In transit</span><strong>{inTransit}</strong></div>
          <div><span>Delivered</span><strong>{delivered}</strong></div>
          <div className={exceptions ? "has-warning" : undefined}><span>Exceptions</span><strong>{exceptions}</strong></div>
        </section>

        <section className="panel table-panel">
          <PanelHeading
            eyebrow="Operations queue"
            title="All shipments"
            description="Live shipment records with driver assignment and customer context."
            action={<span className="table-count">{shipments.length} records</span>}
          />
          <TableFrame label="CEO shipments table">
            <table className="shipment-table admin-table">
              <thead>
                <tr>
                  <th scope="col">Tracking code</th>
                  <th scope="col">Route</th>
                  <th scope="col">Status</th>
                  <th scope="col">Driver</th>
                  <th scope="col">Customer</th>
                  <th scope="col">ETA</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td><span className="tracking-code">{shipment.trackingCode}</span></td>
                    <td><span className="route-cell">{shipment.origin}<span aria-hidden="true">→</span>{shipment.destination}</span></td>
                    <td><StatusBadge status={shipment.status} /></td>
                    <td>
                      <div className="driver-cell">
                        <strong>{shipment.driverName ?? "Unassigned"}</strong>
                        {shipment.driverId && shipment.assignmentStatus === "PENDING" ? (
                          <small className="assignment-status">Awaiting response</small>
                        ) : null}
                        <DriverAssignment
                          trackingCode={shipment.trackingCode}
                          currentDriverId={shipment.driverId}
                          drivers={shipmentOptions.drivers}
                        />
                      </div>
                    </td>
                    <td>{shipment.customerName}</td>
                    <td className="table-value">{shipment.eta}</td>
                  </tr>
                ))}
                {shipments.length === 0 ? (
                  <tr>
                    <td className="table-empty" colSpan={6}>No shipments have been created yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </TableFrame>
        </section>
      </main>
    </div>
  );
}
