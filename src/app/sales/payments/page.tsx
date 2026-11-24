import { PaymentLedgerView } from "@/components/payment-ledger-view";
import { Sidebar } from "@/components/sidebar";
import { getPaymentLedger } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SalesPaymentsPage() {
  const ledger = await getPaymentLedger();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main admin-page payments-page">
        <PaymentLedgerView ledger={ledger} canRecordPayments={false} eyebrow="Sales workspace | Payments" />
      </main>
    </div>
  );
}
