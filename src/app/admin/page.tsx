import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { LiveTrackingMap } from "@/components/live-tracking-map";
import { getLogisticsDashboard, getShipmentAlerts } from "@/lib/data";
import { getLiveTrackingData } from "@/lib/tracking";
import { statusLabels, type LiveTrackingData } from "@/lib/types";

export const dynamic = "force-dynamic";

const emptyDashboard: Awaited<ReturnType<typeof getLogisticsDashboard>> = {
  totalLoads: 0,
  totalRevenue: 0,
  totalMiles: 0,
  averageMpg: 0,
  activeDrivers: 0,
  activeTrucks: 0,
  totalDeliveryEvents: 0,
  onTimeDeliveryRate: 0,
  safetyIncidents: 0,
  recentLoads: [],
};

const emptyAlerts: Awaited<ReturnType<typeof getShipmentAlerts>> = {
  count: 0,
  items: [],
};

const emptyLiveTracking: LiveTrackingData = {
  shipments: [],
  summary: { total: 0, inTransit: 0, exceptions: 0, stale: 0, delivered: 0 },
  generatedAt: new Date(0).toISOString(),
};

export default async function AdminPage() {
  const [dashboardResult, alertsResult, liveTrackingResult] = await Promise.allSettled([
    getLogisticsDashboard(),
    getShipmentAlerts(),
    getLiveTrackingData(),
  ]);
  const dashboardAvailable = dashboardResult.status === "fulfilled";
  const alertsAvailable = alertsResult.status === "fulfilled";
  const trackingAvailable = liveTrackingResult.status === "fulfilled";
  const dataUnavailable = !dashboardAvailable || !alertsAvailable || !trackingAvailable;
  const dashboard = dashboardAvailable ? dashboardResult.value : emptyDashboard;
  const alerts = alertsAvailable ? alertsResult.value : emptyAlerts;
  const liveTracking = trackingAvailable ? liveTrackingResult.value : emptyLiveTracking;

  const unavailableSections = [
    !dashboardAvailable ? "logistics dashboard" : null,
    !alertsAvailable ? "shipment alerts" : null,
    !trackingAvailable ? "live tracking" : null,
  ].filter(Boolean);
  if (unavailableSections.length) {
    console.warn(`Admin dashboard loaded in degraded mode. Unavailable data: ${unavailableSections.join(", ")}.`);
  }

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
        {dataUnavailable ? (
          <section className="panel database-offline-panel" role="status">
            <div>
              <div className="eyebrow">Data connection issue</div>
              <h2>Operations database unavailable</h2>
              <p>
                FleetFlow could not load all operations data from Neon. Any sections that responded remain visible.
                Check the database availability and connection settings, then reload.
              </p>
            </div>
            <Link className="button secondary" href="/admin">Retry</Link>
          </section>
        ) : null}
        <section className={`panel alerts-panel${alertsAvailable && alerts.count ? " has-alerts" : ""}`}>
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Operations watch</div>
              <h2>Needs attention <span className="alert-count">{alertsAvailable ? number.format(alerts.count) : "—"}</span></h2>
            </div>
            <Link href="/admin/shipments">Review shipments →</Link>
          </div>
          {!alertsAvailable ? (
            <p className="alerts-clear alerts-unavailable">Shipment alert data could not be loaded.</p>
          ) : alerts.items.length ? (
            <>
              <div className="alerts-list">
                {alerts.items.map((alert) => (
                  <article className="alert-item" key={alert.trackingCode}>
                    <span
                      className={`alert-indicator${alert.status === "EXCEPTION" ? " is-exception" : ""}`}
                      aria-hidden="true"
                    />
                    <div className="alert-content">
                      <div className="alert-title">
                        <strong>{alert.trackingCode}</strong>
                        <span className={`status-badge status-${alert.status.toLowerCase()}`}>
                          {statusLabels[alert.status]}
                        </span>
                      </div>
                      <p>{alert.origin} → {alert.destination}</p>
                      <small>
                        {alert.status === "EXCEPTION"
                          ? alert.notes || "Shipment is marked for review."
                          : `No update for ${alert.staleHours} hours.`}
                      </small>
                    </div>
                    <Link
                      className="alert-link"
                      href="/admin/shipments"
                      aria-label={`Review shipment ${alert.trackingCode}`}
                    >
                      Review
                    </Link>
                  </article>
                ))}
              </div>
              {alerts.count > alerts.items.length ? (
                <p className="alerts-overflow">
                  Showing {alerts.items.length} of {number.format(alerts.count)} alerts.
                </p>
              ) : null}
            </>
          ) : (
            <p className="alerts-clear">All shipments are up to date. No active exceptions.</p>
          )}
        </section>
        <LiveTrackingMap initialData={liveTracking} initialAvailable={trackingAvailable} />
        <section className="metrics">
          <div className="metric-card">
            <div className="metric-label">Total loads</div>
            <div className="metric-value">{dashboardAvailable ? number.format(dashboard.totalLoads) : "—"}</div>
            <div className="metric-note">{dashboardAvailable ? "All imported load records" : "Database unavailable"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Load revenue</div>
            <div className="metric-value">{dashboardAvailable ? currency.format(dashboard.totalRevenue) : "—"}</div>
            <div className="metric-note">{dashboardAvailable ? "Sum of recorded load revenue" : "Database unavailable"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Miles driven</div>
            <div className="metric-value">{dashboardAvailable ? number.format(dashboard.totalMiles) : "—"}</div>
            <div className="metric-note">{dashboardAvailable ? "Recorded trip distance" : "Database unavailable"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active drivers</div>
            <div className="metric-value">{dashboardAvailable ? number.format(dashboard.activeDrivers) : "—"}</div>
            <div className="metric-note">{dashboardAvailable ? `${number.format(dashboard.activeTrucks)} active trucks` : "Database unavailable"}</div>
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
                    <td colSpan={4}>{dashboardAvailable ? "No imported loads were found in Neon." : "Load data could not be loaded from Neon."}</td>
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
              <div className="activity"><span className="activity-dot" /><div><strong>On-time delivery rate</strong><p>{dashboardAvailable ? `${dashboard.onTimeDeliveryRate.toFixed(1)}% across ${number.format(dashboard.totalDeliveryEvents)} delivery events` : "Database unavailable"}</p></div></div>
              <div className="activity"><span className="activity-dot" /><div><strong>Average fuel efficiency</strong><p>{dashboardAvailable ? `${dashboard.averageMpg.toFixed(2)} MPG across recorded trips` : "Database unavailable"}</p></div></div>
              <div className="activity"><span className="activity-dot" /><div><strong>Safety incidents</strong><p>{dashboardAvailable ? `${number.format(dashboard.safetyIncidents)} records in the imported dataset` : "Database unavailable"}</p></div></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
