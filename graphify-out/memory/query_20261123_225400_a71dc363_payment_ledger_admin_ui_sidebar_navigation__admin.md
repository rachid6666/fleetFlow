---
type: "query"
date: "2026-11-23T22:54:00.309294+00:00"
question: "payment ledger admin UI sidebar navigation /admin/payments payment link auth role"
contributor: "graphify"
outcome: "useful"
source_nodes: ["PaymentLedgerView()", "PaymentsPage()", "SalesPaymentsPage()", "SidebarNavigation()", "RecordPaymentButton()"]
---

# Q: payment ledger admin UI sidebar navigation /admin/payments payment link auth role

## Answer

Confirmed the admin payment page already existed but the payment navigation was absent for Sales users. Added a shared payment-ledger view, retained admin-only payment recording at /admin/payments, added a read-only Sales ledger at /sales/payments, exposed a Payments link in both role sidebars, and linked the Sales open-balances panel to the new ledger. Browser verification confirmed both role links and routes render correctly.

## Outcome

- Signal: useful

## Source Nodes

- PaymentLedgerView()
- PaymentsPage()
- SalesPaymentsPage()
- SidebarNavigation()
- RecordPaymentButton()