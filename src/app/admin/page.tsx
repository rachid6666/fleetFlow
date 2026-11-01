import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { getLogisticsDashboard } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const dashboard = await getLogisticsDashboard();
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const number = new Intl.NumberFormat("en-US");

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">Operations center · Kaggle logistics data</div>
            <h1>Fleet performance</h1>
            <p className="subtitle">
              Live metrics from the logistics dataset stored in Neon.
            </p>
          </div>
          <div className="avatar">FF</div>
        </div>
        <section className="metrics">
          <div className="metric-card">
            <div className="metric-label">Total loads</div>
            <div className="metric-value">{number.format(dashboard.totalLoads)}</div>
            <div className="metric-note">All imported load records</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Load revenue</div>
            <div className="metric-value">{currency.format(dashboard.totalRevenue)}</div>
            <div className="metric-note">Sum of recorded load revenue</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Miles driven</div>
            <div className="metric-value">{number.format(dashboard.totalMiles)}</div>
            <div className="metric-note">Recorded trip distance</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active drivers</div>
            <div className="metric-value">{number.format(dashboard.activeDrivers)}</div>
            <div className="metric-note">{number.format(dashboard.activeTrucks)} active trucks</div>
          </div>
        </section>
        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <h2>Latest loads</h2>
              <Link href="/admin/shipments">FleetFlow shipments →</Link>
            </div>
            <table className="shipment-table">
              <thead>
                <tr>
                  <th>Load</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentLoads.map((load) => (
                  <tr key={load.loadId}>
                    <td>
                      <div className="tracking-code">{load.loadId}</div>
                      <div className="route">{load.loadType} · {load.loadStatus}</div>
                    </td>
                    <td>{load.customer.customerName}</td>
                    <td>
                      {load.route.originCity}, {load.route.originState} →{" "}
                      {load.route.destinationCity}, {load.route.destinationState}
                    </td>
                    <td>{currency.format(load.revenue.toNumber())}</td>
                  </tr>
                ))}
                {dashboard.recentLoads.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No imported loads were found in Neon.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Fleet health</h2>
            </div>
            <div className="activity-list">
              <div className="activity"><span className="activity-dot" /><div><strong>On-time delivery rate</strong><p>{dashboard.onTimeDeliveryRate.toFixed(1)}% across {number.format(dashboard.totalDeliveryEvents)} delivery events</p></div></div>
              <div className="activity"><span className="activity-dot" /><div><strong>Average fuel efficiency</strong><p>{dashboard.averageMpg.toFixed(2)} MPG across recorded trips</p></div></div>
              <div className="activity"><span className="activity-dot" /><div><strong>Safety incidents</strong><p>{number.format(dashboard.safetyIncidents)} records in the imported dataset</p></div></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
