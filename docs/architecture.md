# FleetFlow architecture

## Operating model

FleetFlow has four experiences over one shipment domain:

1. **CEO/Admin operations** create shipments, manage users, assign drivers, record payments, and monitor sales and operational bottlenecks.
2. **Sales workspace** creates customer shipments and views sales, receivables, live operations, and alerts. Sales users cannot assign drivers or mutate the payment ledger.
3. **Driver operations** are optimized for a small screen and fast, deliberate status changes.
4. **Customer workspace** lists only shipments linked to the signed-in customer and exposes a customer-safe tracking timeline.

The shipment is the system of record. `StatusLog` is append-only audit history and must be written in the same database transaction as a shipment status change.

`KaggleFacility` is the current operational location source. Shipment forms use the 50 geocoded U.S. facilities in Neon, and shipments retain origin/destination facility relations plus human-readable route fields. The older `Branch` model remains in the schema but is not used by current shipment creation.

See [Business logic](business-logic.md) for the implemented shipment, assignment, proof, handover, and alert rules, their current gaps, and proposed rules with acceptance scenarios. Proposed policies in that document are not yet enforced by the application.

## Application boundaries

- **Web:** Next.js App Router, server-rendered pages where possible, client components only for interactive workflows.
- **Domain actions:** typed server actions or route handlers validate input, authorize the actor, and call Prisma.
- **Persistence:** PostgreSQL accessed through Prisma; migrations are committed to version control.
- **Identity:** Auth.js session claims include the role. Authorization is enforced at the route boundary and again in domain actions.
- **Files:** proof-of-delivery uploads should use object storage in production; store metadata or a durable URL, not large binary files in PostgreSQL.

## Authorization matrix

| Capability | Admin | Sales | Driver | Customer |
|---|---:|---:|---:|---:|
| Create customer shipment | yes | yes | no | no |
| Set shipment charge | yes | yes | no | no |
| Assign / reassign driver | yes | no | no | no |
| View all operational shipments | yes | yes | no | no |
| View assigned shipments | yes | no | yes | no |
| View sales and receivables dashboard | yes | yes | no | no |
| Record shipment payment | yes | no | no | no |
| Update shipment status | yes | no | assigned only | no |
| Add POD notes | yes | no | assigned only | no |
| View live fleet map | yes | yes | no | no |
| Tracking lookup | all | all shipment list | assigned only | own only |

## Payment ledger

`Shipment.chargeAmount` stores the optional USD amount billed for a shipment. `ShipmentPayment` stores append-only payment receipts with amount, currency, method, reference, receive time, and the recording admin's email. The ledger derives `PAID`, `PARTIAL`, `UNPAID`, `RECORDED`, or `NO_CHARGE` states instead of storing a mutable status field.

The payment ledger records payments received outside FleetFlow. It does not initiate card charges, refunds, or transfers. Admins can write payment records through the protected API. Sales users can read aggregate receivables and per-shipment balances in the Sales workspace.

## Shipment creation and tracking

Admins and sales users create shipments only from different Neon facilities and an active Authentik customer projection. A shipment starts in `PENDING` status. Creation writes the shipment, initial audit entry, charge, and an initial `ShipmentLocationPing` at the origin in one transaction.

The live tracking query includes active facility-based shipments even when they have no telemetry. A shipment without pings is placed at its origin, or at its destination when delivered, so newly created shipments appear immediately. `npm run db:seed:tracking` refreshes seven marked synthetic routes for local demonstrations.

## Status rules

The implementation supports `PENDING`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, and `EXCEPTION`. The shared transition guard lives in `src/lib/shipment-rules.ts`; the status-change action calls it before writing and records the initiating actor's email in the audit event. The complete transition table and missing delivery prerequisites are documented in [Business logic](business-logic.md#3-shipment-lifecycle--bl-03).

At minimum, a transition must:

1. validate the actor and requested next status;
2. update `Shipment`;
3. insert a matching `StatusLog` row;
4. commit all writes atomically;
5. return a safe, minimal result to the caller.
