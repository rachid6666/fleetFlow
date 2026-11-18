import { DriverAvailabilityControl } from "@/components/driver-availability-control";
import { Sidebar } from "@/components/sidebar";
import { listDrivers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const drivers = await listDrivers();
  const available = drivers.filter((driver) => driver.availability === "AVAILABLE").length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">Admin · Drivers group</div>
            <h1>Driver availability</h1>
            <p className="subtitle">Configure which drivers are available for operations.</p>
          </div>
          <div className="avatar">{available}/{drivers.length}</div>
        </div>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Drivers group</h2>
              <p className="panel-description">{available} available · {drivers.length - available} unavailable</p>
            </div>
          </div>
          <div className="driver-directory">
            {drivers.map((driver) => (
              <article className="driver-directory-row" key={driver.id}>
                <div>
                  <strong>{driver.name}</strong>
                  <span>{driver.email}</span>
                </div>
                <DriverAvailabilityControl
                  driverId={driver.id}
                  current={driver.availability}
                  canSelectDriver
                />
              </article>
            ))}
            {drivers.length === 0 ? <p className="empty-panel">No drivers are configured.</p> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
