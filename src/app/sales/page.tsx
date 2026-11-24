import Link from "next/link";
import { PageHeader, PanelHeading, TableFrame } from "@/components/admin-ui";
import { CreateShipmentButton } from "@/components/create-shipment-button";
import { LiveTrackingMap } from "@/components/live-tracking-map";
import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import {
  getLogisticsDashboard,
  getPaymentLedger,
  getShipmentAlerts,
  getShipmentFormOptions,
  listShipments,
  type PaymentLedger,
  type ShipmentFormOptions,
} from "@/lib/data";
import { getLiveTrackingData } from "@/lib/tracking";
import type { LiveTrackingData, Shipment } from "@/lib/types";

export const dynamic = "force-dynamic";

const emptyLedger: PaymentLedger = {
  items: [],
  summary: {
    totalCharged: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    unpaidShipments: 0,
  },
};

const emptyTracking: LiveTrackingData = {
  shipments: [],
  summary: { total: 0, inTransit: 0, exceptions: 0, stale: 0, delivered: 0 },
  generatedAt: new Date(0).toISOString(),
};

const emptyOptions: ShipmentFormOptions = { locations: [], drivers: [], customers: [] };

export default async function SalesDashboardPage() {
  const [
    shipmentsResult,
    paymentsResult,
    logisticsResult,
    trackingResult,
    optionsResult,
    alertsResult,
  ] = await Promise.allSettled([
    listShipments(),
    getPaymentLedger(),
    getLogisticsDashboard(),
    getLiveTrackingData(),
    getShipmentFormOptions(),
    getShipmentAlerts(),
  ]);

  const shipments: Shipment[] = shipmentsResult.status === "fulfilled" ? shipmentsResult.value : [];
  const ledger = paymentsResult.status === "fulfilled" ? paymentsResult.value : emptyLedger;
  const logistics = logisticsResult.status === "fulfilled" ? logisticsResult.value : null;
  const tracking = trackingResult.status === "fulfilled" ? trackingResult.value : emptyTracking;
  const options = optionsResult.status === "fulfilled" ? optionsResult.value : emptyOptions;
  const alerts = alertsResult.status === "fulfilled" ? alertsResult.value : { count: 0, items: [] };
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const number = new Intl.NumberFormat("en-US");
  const latestShipments = shipments.slice(0, 8);
  const outstanding = ledger.items
    .filter((item) => (item.balanceAmount ?? 0) > 0 || item.paymentStatus === "UNPAID")
    .slice(0, 6);
  const servicesAvailable = optionsResult.status === "fulfilled" && options.customers.length > 0;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main admin-page sales-page">
        <PageHeader
          eyebrow="Sales workspace"
          title="Sales & operations"
          description="Create customer shipments, follow operational exceptions, and monitor receivables from one workspace."
          actions={servicesAvailable
            ? <CreateShipmentButton options={options} allowDriverAssignment={false} />
            : <span className="status-badge status-exception">Shipment setup unavailable</span>}
          account={<span aria-label={`${shipments.length} customer shipments`}>{number.format(shipments.length)}</span>}
        />

        <section className="summary-strip" aria-label="Sales and operations summary">
          <div><span>Customer shipments</span><strong>{number.format(shipments.length)}</strong></div>
          <div><span>In transit</span><strong>{number.format(tracking.summary.inTransit)}</strong></div>
          <div><span>Charged</span><strong>{currency.format(ledger.summary.totalCharged)}</strong></div>
          <div className={ledger.summary.totalOutstanding > 0 ? "has-warning" : undefined}>
            <span>Outstanding</span><strong>{currency.format(ledger.summary.totalOutstanding)}</strong>
          </div>
        </section>

        <div className="overview-dashboard-grid">
          <div className="overview-left-stack">
            <section className="panel">
              <PanelHeading
                eyebrow="Revenue pipeline"
                title="Sales and receivables"
                description="Shipment charges and collected balances from the payment ledger."
                action={<span className="table-count">{ledger.summary.unpaidShipments} open</span>}
              />
              <div className="summary-strip sales-receivables-strip">
                <div><span>Collected</span><strong>{currency.format(ledger.summary.totalCollected)}</strong></div>
                <div><span>Outstanding</span><strong>{currency.format(ledger.summary.totalOutstanding)}</strong></div>
                <div><span>Recorded loads</span><strong>{logistics ? number.format(logistics.totalLoads) : "-"}</strong></div>
                <div><span>On-time deliveries</span><strong>{logistics ? `${logistics.onTimeDeliveryRate.toFixed(1)}%` : "?"}</strong></div>
              </div>
            </section>

            <section className="panel table-panel">
              <PanelHeading
                eyebrow="Operations queue"
                title="Latest customer shipments"
                description="Current shipment status and payment position."
                action={<span className="table-count">{shipments.length} total</span>}
              />
              <TableFrame label="Latest sales shipments">
                <table className="shipment-table admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Shipment</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Route</th>
                      <th scope="col">Status</th>
                      <th scope="col">Charge</th>
                      <th scope="col">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestShipments.map((shipment) => {
                      const payment = ledger.items.find((item) => item.shipmentId === shipment.id);
                      return (
                        <tr key={shipment.id}>
                          <td><span className="tracking-code">{shipment.trackingCode}</span></td>
                          <td>{shipment.customerName}</td>
                          <td><span className="route-cell">{shipment.origin}<span aria-hidden="true">{"->"}</span>{shipment.destination}</span></td>
                          <td><StatusBadge status={shipment.status} /></td>
                          <td className="table-value">{payment?.chargeAmount == null ? "Not set" : currency.format(payment.chargeAmount)}</td>
                          <td className="table-value">{payment?.balanceAmount == null ? "-" : currency.format(payment.balanceAmount)}</td>
                        </tr>
                      );
                    })}
                    {latestShipments.length === 0 ? (
                      <tr><td className="table-empty" colSpan={6}>No customer shipments have been created yet.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </TableFrame>
            </section>
          </div>

          <aside className="overview-right-stack">
            <LiveTrackingMap initialData={tracking} initialAvailable={trackingResult.status === "fulfilled"} compact />
            <section className="panel">
              <PanelHeading
                eyebrow="Receivables watch"
                title="Open balances"
                action={<Link href="/sales/payments">View ledger {"->"}</Link>}
              />
              <div className="sales-balance-list">
                {outstanding.map((item) => (
                  <article key={item.shipmentId}>
                    <div>
                      <strong>{item.trackingCode}</strong>
                      <small>{item.customerName} | {item.origin}{" -> "}{item.destination}</small>
                    </div>
                    <span>{currency.format(item.balanceAmount ?? 0)}</span>
                  </article>
                ))}
                {outstanding.length === 0 ? <p className="alerts-clear">No customer balances are outstanding.</p> : null}
              </div>
            </section>

            <section className="panel">
              <PanelHeading eyebrow="Operations watch" title="Shipment alerts" />
              <div className="sales-balance-list">
                {alerts.items.slice(0, 4).map((alert) => (
                  <article key={alert.trackingCode}>
                    <div>
                      <strong>{alert.trackingCode}</strong>
                      <small>{alert.origin}{" -> "}{alert.destination} | {alert.status === "EXCEPTION" ? "Needs review" : `${alert.staleHours} hr without update`}</small>
                    </div>
                    <span>{alert.status === "EXCEPTION" ? "Exception" : "Stale"}</span>
                  </article>
                ))}
                {alerts.items.length === 0 ? <p className="alerts-clear">No shipment exceptions need sales follow-up.</p> : null}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
