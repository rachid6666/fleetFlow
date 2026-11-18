# FleetFlow architecture

## Operating model

FleetFlow has three experiences over one shipment domain:

1. **Admin operations** create shipments, manage users, assign drivers, and monitor bottlenecks.
2. **Driver operations** are optimized for a small screen and fast, deliberate status changes.
3. **Customer workspace** lists only shipments linked to the signed-in customer and exposes a customer-safe tracking timeline.

The shipment is the system of record. `StatusLog` is append-only audit history and must be written in the same database transaction as a shipment status change.

`Branch` is the network's operational location record. It stores the active hub or partner branch, country, region, coordinates, and whether the branch currently participates in routing. Shipments can reference both an origin and destination branch while retaining human-readable route fields.

See [Business logic](business-logic.md) for the implemented shipment, assignment, proof, handover, and alert rules, their current gaps, and proposed rules with acceptance scenarios. Proposed policies in that document are not yet enforced by the application.

## Application boundaries

- **Web:** Next.js App Router, server-rendered pages where possible, client components only for interactive workflows.
- **Domain actions:** typed server actions or route handlers validate input, authorize the actor, and call Prisma.
- **Persistence:** PostgreSQL accessed through Prisma; migrations are committed to version control.
- **Identity:** Auth.js session claims include the role. Authorization is enforced at the route boundary and again in domain actions.
- **Files:** proof-of-delivery uploads should use object storage in production; store metadata or a durable URL, not large binary files in PostgreSQL.

## Authorization matrix

| Capability | Admin | Driver | Customer |
|---|---:|---:|---:|
| Create shipment | yes | no | no |
| Assign / reassign driver | yes | no | no |
| View assigned shipments | yes | yes | own only |
| Update shipment status | yes | assigned only | no |
| Add POD notes | yes | assigned only | no |
| Tracking lookup | all | assigned only | own only |

## Status rules

The implementation supports `PENDING`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, and `EXCEPTION`. The shared transition guard lives in `src/lib/shipment-rules.ts`; the status-change action calls it before writing and records the initiating actor's email in the audit event. The complete transition table and missing delivery prerequisites are documented in [Business logic](business-logic.md#3-shipment-lifecycle--bl-03).

At minimum, a transition must:

1. validate the actor and requested next status;
2. update `Shipment`;
3. insert a matching `StatusLog` row;
4. commit all writes atomically;
5. return a safe, minimal result to the caller.
