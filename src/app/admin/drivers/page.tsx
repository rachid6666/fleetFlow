import { MetricCard, PageHeader, PanelHeading, TableFrame } from "@/components/admin-ui";
import { DriverAvailabilityControl } from "@/components/driver-availability-control";
import { Sidebar } from "@/components/sidebar";
import { listDrivers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const drivers = await listDrivers();
  const available = drivers.filter((driver) => driver.availability === "AVAILABLE").length;
  const unavailable = drivers.length - available;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main admin-page drivers-page">
        <PageHeader
          eyebrow="CEO panel · Driver group"
          title="Driver availability"
          description="Manage dispatch availability across the FleetFlow driver group."
          account={<span aria-label={`${drivers.length} drivers`}>{drivers.length}</span>}
        />

        <section className="metrics driver-metrics" aria-label="Driver availability summary">
          <MetricCard tone="forest" label="Registered drivers" value={drivers.length} note="Driver accounts in this workspace" />
          <MetricCard tone="emerald" label="Available now" value={available} note="Eligible for dispatch assignments" />
          <MetricCard label="Unavailable" value={unavailable} note="Hidden from active dispatch availability" />
        </section>

        <section className="panel table-panel">
          <PanelHeading
            eyebrow="Dispatch readiness"
            title="Drivers group"
            description={`${available} available · ${unavailable} unavailable`}
            action={<span className="table-count">{drivers.length} drivers</span>}
          />
          <TableFrame label="FleetFlow drivers table">
            <table className="shipment-table admin-table drivers-table">
              <thead>
                <tr>
                  <th scope="col">Driver</th>
                  <th scope="col">Email</th>
                  <th scope="col">Availability</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>
                      <div className="person-cell">
                        <span className="person-avatar" aria-hidden="true">{driver.name.slice(0, 1).toUpperCase()}</span>
                        <strong>{driver.name}</strong>
                      </div>
                    </td>
                    <td>{driver.email}</td>
                    <td>
                      <DriverAvailabilityControl
                        driverId={driver.id}
                        current={driver.availability}
                        canSelectDriver
                        driverName={driver.name}
                      />
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 ? (
                  <tr>
                    <td className="table-empty" colSpan={3}>No drivers are configured.</td>
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
