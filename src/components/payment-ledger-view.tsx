import { PageHeader, PanelHeading, TableFrame } from "@/components/admin-ui";
import { RecordPaymentButton } from "@/components/record-payment-button";
import { StatusBadge } from "@/components/status-badge";
import type { PaymentLedger, PaymentLedgerStatus } from "@/lib/data";

const paymentStatusLabels: Record<PaymentLedgerStatus, string> = {
  PAID: "Paid",
  PARTIAL: "Partially paid",
  UNPAID: "Unpaid",
  RECORDED: "Payment recorded",
  NO_CHARGE: "No charge",
};

export function PaymentLedgerView({
  ledger,
  canRecordPayments,
  eyebrow = "CEO panel | Payments",
}: {
  ledger: PaymentLedger;
  canRecordPayments: boolean;
  eyebrow?: string;
}) {
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const dateTime = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const columnCount = canRecordPayments ? 8 : 7;

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title="Payment ledger"
        description={canRecordPayments
          ? "Track shipment charges, received payments, and outstanding balances in USD."
          : "View customer charges, collected payments, and outstanding balances. Payment recording is available to administrators."}
        account={<span aria-label={`${ledger.items.length} payment records`}>{ledger.items.length}</span>}
      />

      <section className="summary-strip" aria-label="Payment summary">
        <div><span>Total charged</span><strong>{currency.format(ledger.summary.totalCharged)}</strong></div>
        <div><span>Collected</span><strong>{currency.format(ledger.summary.totalCollected)}</strong></div>
        <div className={ledger.summary.totalOutstanding > 0 ? "has-warning" : undefined}>
          <span>Outstanding</span><strong>{currency.format(ledger.summary.totalOutstanding)}</strong>
        </div>
        <div className={ledger.summary.unpaidShipments > 0 ? "has-warning" : undefined}>
          <span>Unpaid shipments</span><strong>{ledger.summary.unpaidShipments}</strong>
        </div>
      </section>

      <section className="panel table-panel">
        <PanelHeading
          eyebrow="Receivables"
          title="Shipment payments"
          description={canRecordPayments
            ? "Record bank transfers, cards, cash, and other payments against shipment charges."
            : "Read-only payment position for customer shipments."}
          action={<span className="table-count">{ledger.items.length} shipment records</span>}
        />
        <TableFrame label="Shipment payment ledger">
          <table className="shipment-table admin-table">
            <thead>
              <tr>
                <th scope="col">Shipment</th>
                <th scope="col">Customer</th>
                <th scope="col">Route</th>
                <th scope="col">Charge</th>
                <th scope="col">Collected</th>
                <th scope="col">Balance</th>
                <th scope="col">Payment state</th>
                {canRecordPayments ? <th scope="col">Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {ledger.items.map((item) => (
                <tr key={item.shipmentId}>
                  <td>
                    <span className="tracking-code">{item.trackingCode}</span>
                    <div className="route">{item.lastPaymentAt ? `Last payment ${dateTime.format(new Date(item.lastPaymentAt))}` : "No payment recorded"}</div>
                  </td>
                  <td>{item.customerName}</td>
                  <td><span className="route-cell">{item.origin}<span aria-hidden="true">{" -> "}</span>{item.destination}</span></td>
                  <td className="table-value">{item.chargeAmount == null ? "Not set" : currency.format(item.chargeAmount)}</td>
                  <td className="table-value">{currency.format(item.collectedAmount)}</td>
                  <td className="table-value">{item.balanceAmount == null ? "-" : currency.format(item.balanceAmount)}</td>
                  <td>
                    <span className={`payment-status is-${item.paymentStatus.toLowerCase()}`}>
                      {paymentStatusLabels[item.paymentStatus]}
                    </span>
                    <div><StatusBadge status={item.status} /></div>
                  </td>
                  {canRecordPayments ? (
                    <td>
                      <RecordPaymentButton
                        shipmentId={item.shipmentId}
                        trackingCode={item.trackingCode}
                        balanceAmount={item.balanceAmount}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
              {ledger.items.length === 0 ? (
                <tr>
                  <td className="table-empty" colSpan={columnCount}>No shipments are available to bill yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </TableFrame>
      </section>
    </>
  );
}
