import Link from "next/link";
import { PanelHeading, TableFrame } from "@/components/admin-ui";
import { LiveTrackingMap } from "@/components/live-tracking-map";
import { MapcnNetworkMap } from "@/components/mapcn-network-map";
import { Sidebar } from "@/components/sidebar";
import { getFacilityMapLocations, getLogisticsDashboard, getShipmentAlerts } from "@/lib/data";
import { getLiveTrackingData } from "@/lib/tracking";
import { statusLabels, type FacilityMapLocation, type LiveTrackingData } from "@/lib/types";

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

const emptyFacilityLocations: FacilityMapLocation[] = [];

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
  );
}

export default async function AdminPage() {
  const [dashboardResult, alertsResult, liveTrackingResult, facilitiesResult] = await Promise.allSettled([
    getLogisticsDashboard(),
    getShipmentAlerts(),
    getLiveTrackingData(),
    getFacilityMapLocations(),
  ]);
  const dashboardAvailable = dashboardResult.status === "fulfilled";
  const alertsAvailable = alertsResult.status === "fulfilled";
  const trackingAvailable = liveTrackingResult.status === "fulfilled";
  const facilitiesAvailable = facilitiesResult.status === "fulfilled";
  const dataUnavailable = !dashboardAvailable || !alertsAvailable || !trackingAvailable || !facilitiesAvailable;
  const dashboard = dashboardAvailable ? dashboardResult.value : emptyDashboard;
  const alerts = alertsAvailable ? alertsResult.value : emptyAlerts;
  const liveTracking = trackingAvailable ? liveTrackingResult.value : emptyLiveTracking;
  const facilityLocations = facilitiesAvailable ? facilitiesResult.value : emptyFacilityLocations;

  const unavailableSections = [
    !dashboardAvailable ? "logistics dashboard" : null,
    !alertsAvailable ? "shipment alerts" : null,
    !trackingAvailable ? "live tracking" : null,
    !facilitiesAvailable ? "facility locations" : null,
  ].filter(Boolean);
  if (unavailableSections.length) {
    console.warn(`Admin dashboard loaded in degraded mode. Unavailable data: ${unavailableSections.join(", ")}.`);
  }

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const number = new Intl.NumberFormat("en-US");

  return (
    <div className="overview-reference-shell">
      <div className="app-shell overview-app-shell">
        <Sidebar />
        <main className="main overview-main">
          <header className="overview-dashboard-header">
            <div className="overview-dashboard-title">
              <h1>Dashboard</h1>
              <p>FleetFlow operations overview</p>
            </div>
            <div className="overview-dashboard-actions">
              <Link
                className="overview-alert-button"
                href="/admin/shipments"
                aria-label={`${alertsAvailable ? alerts.count : "Unavailable"} shipment alerts`}
              >
                <BellIcon />
                <span>{alertsAvailable ? number.format(alerts.count) : "!"}</span>
              </Link>
              <Link className="overview-add-widget" href="/admin/analytics">
                <span aria-hidden="true">+</span>
                Open analytics
              </Link>
              <div className="overview-header-avatar" aria-label="FleetFlow CEO">FF</div>
            </div>
          </header>

          {dataUnavailable ? (
            <section className="panel database-offline-panel overview-data-notice" role="status">
              <div>
                <div className="eyebrow">Data connection issue</div>
                <h2>Some operations data is unavailable</h2>
                <p>Available dashboard sections remain visible while FleetFlow retries the unavailable Neon data.</p>
              </div>
              <Link className="button secondary" href="/admin">Retry</Link>
            </section>
          ) : null}

          <section className="overview-kpi-grid" aria-label="Fleet performance metrics">
            <article className="overview-kpi-card is-dark">
              <div className="overview-kpi-label"><span>Total loads</span><span>All records</span></div>
              <strong>{dashboardAvailable ? number.format(dashboard.totalLoads) : "—"}</strong>
              <div className="overview-kpi-footer">
                <span>{dashboardAvailable ? "Imported Kaggle logistics data" : "Database unavailable"}</span>
                <span className="overview-mini-bars" aria-hidden="true"><i /><i /><i /><i /></span>
              </div>
            </article>
            <article className="overview-kpi-card">
              <div className="overview-kpi-label"><span>Load revenue</span><span>USD</span></div>
              <strong>{dashboardAvailable ? currency.format(dashboard.totalRevenue) : "—"}</strong>
              <div className="overview-kpi-footer">
                <span>{dashboardAvailable ? "Sum of recorded load revenue" : "Database unavailable"}</span>
                <span className="overview-mini-bars is-mixed" aria-hidden="true"><i /><i /><i /><i /></span>
              </div>
            </article>
            <article className="overview-kpi-card">
              <div className="overview-kpi-label"><span>Miles driven</span><span>Recorded</span></div>
              <strong>{dashboardAvailable ? number.format(dashboard.totalMiles) : "—"}</strong>
              <div className="overview-kpi-footer">
                <span>{dashboardAvailable ? "Distance across imported trips" : "Database unavailable"}</span>
                <span className="overview-mini-bars" aria-hidden="true"><i /><i /><i /><i /></span>
              </div>
            </article>
          </section>

          <div className="overview-dashboard-grid">
            <div className="overview-left-stack">
              <section className="panel overview-chart-panel">
                <PanelHeading
                  eyebrow="Neon logistics data"
                  title="Facility network map"
                  description="U.S. facilities from Neon shown across the global network."
                  action={<Link className="overview-range-pill" href="/admin/analytics">Full analytics</Link>}
                />
                <MapcnNetworkMap locations={facilityLocations} locationsAvailable={facilitiesAvailable} />
              </section>

              <section className="panel overview-loads-panel">
                <PanelHeading
                  eyebrow="Historical logistics"
                  title="Latest loads"
                  action={<Link href="/admin/shipments">View all →</Link>}
                />
                <TableFrame label="Latest imported loads">
                  <table className="shipment-table dashboard-table overview-loads-table">
                    <thead>
                      <tr>
                        <th scope="col">Load</th>
                        <th scope="col">Customer</th>
                        <th scope="col">Route</th>
                        <th scope="col">Revenue</th>
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
                          <td>{load.route.originCity}, {load.route.originState} → {load.route.destinationCity}, {load.route.destinationState}</td>
                          <td className="table-value">{currency.format(load.revenue.toNumber())}</td>
                        </tr>
                      ))}
                      {dashboard.recentLoads.length === 0 ? (
                        <tr>
                          <td colSpan={4}>{dashboardAvailable ? "No imported loads were found in Neon." : "Load data could not be loaded from Neon."}</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </TableFrame>
              </section>
            </div>

            <aside className="overview-right-stack">
              <section className="overview-fleet-summary" aria-label="Fleet readiness summary">
                <div className="overview-summary-label">
                  <span>Fleet readiness</span>
                  <span className="overview-summary-mark" aria-hidden="true">↗</span>
                </div>
                <div className="overview-summary-value">
                  <strong>{dashboardAvailable ? number.format(dashboard.activeDrivers) : "—"}</strong>
                  <span>active drivers</span>
                </div>
                <p>{dashboardAvailable ? `${number.format(dashboard.activeTrucks)} active trucks in the imported fleet` : "Fleet data unavailable"}</p>
                <div className="overview-summary-rows">
                  <div>
                    <span className="overview-summary-icon" aria-hidden="true">✓</span>
                    <span><strong>On-time delivery</strong><small>{dashboardAvailable ? `${dashboard.onTimeDeliveryRate.toFixed(1)}% across ${number.format(dashboard.totalDeliveryEvents)} events` : "Unavailable"}</small></span>
                  </div>
                  <div>
                    <span className="overview-summary-icon" aria-hidden="true">↗</span>
                    <span><strong>Fuel efficiency</strong><small>{dashboardAvailable ? `${dashboard.averageMpg.toFixed(2)} MPG · ${number.format(dashboard.safetyIncidents)} safety records` : "Unavailable"}</small></span>
                  </div>
                </div>
              </section>

              <LiveTrackingMap initialData={liveTracking} initialAvailable={trackingAvailable} compact />
            </aside>
          </div>

          <section className={`panel overview-alert-panel${alertsAvailable && alerts.count ? " has-alerts" : ""}`}>
            <PanelHeading
              eyebrow="Operations watch"
              title={<>Needs attention <span className="alert-count">{alertsAvailable ? number.format(alerts.count) : "—"}</span></>}
              action={<Link href="/admin/shipments">Review shipments →</Link>}
            />
            {!alertsAvailable ? (
              <p className="alerts-clear alerts-unavailable">Shipment alert data could not be loaded.</p>
            ) : alerts.items.length ? (
              <div className="overview-alert-list">
                {alerts.items.map((alert) => (
                  <article className="alert-item" key={alert.trackingCode}>
                    <span className={`alert-indicator${alert.status === "EXCEPTION" ? " is-exception" : ""}`} aria-hidden="true" />
                    <div className="alert-content">
                      <div className="alert-title">
                        <strong>{alert.trackingCode}</strong>
                        <span className={`status-badge status-${alert.status.toLowerCase()}`}>{statusLabels[alert.status]}</span>
                      </div>
                      <p>{alert.origin} → {alert.destination}</p>
                      <small>{alert.status === "EXCEPTION" ? alert.notes || "Shipment is marked for review." : `No update for ${alert.staleHours} hours.`}</small>
                    </div>
                    <Link className="alert-link" href="/admin/shipments" aria-label={`Review shipment ${alert.trackingCode}`}>Review</Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="alerts-clear">All shipments are up to date. No active exceptions.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
