# FleetFlow business logic

Business logic defines who can perform an action, which conditions must be met, what changes, and what evidence is kept. In FleetFlow, it governs shipment creation, driver assignments, delivery progress, proof of delivery, and operational alerts.

This document separates behavior found in the application code on **2026-11-23** from additional rules proposed for implementation. **Implemented** means the rule is present in code; it does not mean the scenarios below have been executed as tests. **Partial** means the workflow exists but a related check is missing. **Proposed** means the rule is not currently enforced.

The operational policies in [the agent guide](../agent.md), including vehicle inspections, delivery geofences, and escalation thresholds, describe intended behavior. They must not be assumed to work until implemented in server-side actions.

## 1. Roles and ownership — BL-01

**Status: Implemented.** Permissions come from the authenticated session, and shipment ownership is checked on the server.

| Business action | Admin | Sales | Driver | Customer |
|---|---|---|---|---|
| Create a customer shipment | Allowed | Allowed | Not allowed | Not allowed |
| Set a shipment charge | Allowed | Allowed | Not allowed | Not allowed |
| Read shipments | All | All | Assigned shipments | Own shipments |
| Assign or unassign a driver | Allowed | Not allowed | Not allowed | Not allowed |
| Accept or reject an assignment | Driver response endpoint only | Not allowed | Own pending assignment | Not allowed |
| Change shipment status | Allowed, subject to transition rules | Not allowed | Own accepted assignment | Not allowed |
| Add notes or upload/read delivery proof | Allowed | Not allowed | Own accepted assignment | Not allowed |
| Record a payment | Allowed | Not allowed | Not allowed | Not allowed |
| Request a driver handover | Shipment with a current driver | Not allowed | Own assigned shipment | Not allowed |
| Change driver availability | Any driver | Not allowed | Self only | Not allowed |
| Submit GPS positions | Any shipment | Not allowed | Own assigned shipment | Not allowed |
| View the live fleet map and operations dashboard | Allowed | Allowed | Not allowed | Not allowed |
| Use the operations copilot | Allowed | Not allowed | Not allowed | Not allowed |

Driver and customer ownership use case-insensitive matching against the signed-in email. Customers receive tracking-safe fields and generic event descriptions; internal notes, driver identities, and delivery-proof metadata/files are excluded. Knowing a tracking code does not grant access to another customer's shipment.

Assignment acceptance is required for driver status changes, notes, and proof access. It is **not currently required** for GPS ingestion or initiating a handover. A receiving driver must accept a handover before performing the operations that require acceptance.

Sources: [access concept](access-concept.md), [shipment domain actions](../src/lib/data.ts), and [availability endpoint](../src/app/api/drivers/availability/route.ts).

## 2. Shipment creation - BL-02

**Status: Implemented.** An admin or Sales user creates a customer shipment only when:

- The origin and destination reference different U.S. facilities from Neon.
- The customer exists in the synchronized Authentik projection and has the `CUSTOMER` role.
- An optional initial driver exists and has the `DRIVER` role. Only admins can assign that driver.
- A positive shipment charge is required by the current UI and accepted as USD.
- Optional notes contain at most 2,000 characters.

The server generates a tracking code and creates the shipment as `PENDING`. In one transaction it writes the shipment, optional charge, initial `StatusLog`, and an initial `ShipmentLocationPing` at the origin. The database requires a unique tracking code.

When a driver is supplied, `assignmentStatus` starts as `PENDING`. When no driver is supplied, the current implementation stores `assignmentStatus=ACCEPTED` with `driverId=null`. This is a storage convention, not evidence that a driver accepted the job. Always check both fields when determining assignment readiness.

Origin and destination coordinates come from the selected facilities. `estimatedArrival` remains optional and is not calculated during creation. The origin ping makes a newly created shipment appear immediately on the live map.

Sources: [creation endpoint](../src/app/api/shipments/route.ts), `createShipment` in [data.ts](../src/lib/data.ts), and [shipment model](../prisma/schema.prisma).

## 3. Shipment lifecycle — BL-03

**Status: Implemented for status transitions; partial for delivery prerequisites.**

| Current status | Allowed next statuses | Business meaning |
|---|---|---|
| `PENDING` | `DISPATCHED`, `EXCEPTION` | A booked shipment can be dispatched or flagged for attention. |
| `DISPATCHED` | `IN_TRANSIT`, `EXCEPTION` | Dispatched work can start moving or encounter a problem. |
| `IN_TRANSIT` | `DELIVERED`, `EXCEPTION` | A shipment can complete delivery or require intervention. |
| `EXCEPTION` | `DISPATCHED`, `IN_TRANSIT` | Work can resume after an interruption. |
| `DELIVERED` | None | The status cannot be reopened through the normal status endpoint. |

Skipping stages, repeating the current status, and moving out of `DELIVERED` are rejected with HTTP `422`. Both admins and drivers are subject to this transition table. A driver must additionally own and have accepted the assignment. Each successful status change and its audit event are saved together.

Current gaps:

- Admin status changes do not require an assigned or accepted driver.
- Marking a shipment `DELIVERED` does not require proof, a destination geofence check, or a dedicated delivery timestamp.
- Entering or leaving `EXCEPTION` does not require an explanation.
- A terminal status does not freeze other actions: assignment, handover, notes, and proof uploads have no delivered-status guard.
- Cancellation, returns, and partial deliveries have no dedicated status or workflow.

Sources: [transition table](../src/lib/shipment-rules.ts) and `transitionShipmentStatus` in [data.ts](../src/lib/data.ts).

## 4. Assignment and availability — BL-04

**Status: Implemented for assignment responses; partial for driver eligibility.**

1. An admin assigns an existing driver. A changed assignment becomes `PENDING`, and an audit event records the assignment.
2. Only that driver can accept or reject the pending assignment. Responding after it is no longer pending returns HTTP `409`.
3. Acceptance sets `assignmentStatus=ACCEPTED` and enables the protected driver actions.
4. Rejection sets `assignmentStatus=REJECTED`, clears `driverId`, and records the rejection. The shipment status is unchanged.
5. Reassigning the shipment starts a new pending response. Assigning the already-assigned driver is currently a no-op; it does not restart acceptance or create another audit entry.

Driver availability is either `AVAILABLE` or `UNAVAILABLE`. Drivers can change their own value; admins can change any driver's value. Updating availability does not unassign existing work.

Availability is currently informational: creation, assignment, and handover check the driver's role but do not reject an unavailable driver. There is no workload or vehicle-capacity limit, and availability changes do not currently create a shipment audit entry.

Sources: assignment and availability functions in [data.ts](../src/lib/data.ts), [assignment endpoint](../src/app/api/shipments/[trackingCode]/assignment/route.ts), and [response endpoint](../src/app/api/shipments/[trackingCode]/assignment-response/route.ts).

## 5. Notes and proof of delivery — BL-05

**Status: Implemented for uploads and access; partial for delivery evidence.**

- A delivery note must contain 1–2,000 characters after trimming. An optional location label may contain up to 200 characters.
- Saving a note replaces the shipment's current note and adds an audit entry containing the new text and optional location.
- A proof upload must be a nonempty PDF, JPEG, or PNG, no larger than `10 * 1024 * 1024` bytes. The declared MIME type and expected file-signature bytes must match. This is a file-format check, not a review of the evidence's business validity.
- Proof metadata identifies the shipment, uploader, upload time, file type, and size. Files are stored locally in development; metadata and the upload audit entry are written in one database transaction.
- Proof retrieval requires an admin or the currently assigned, accepted driver. Customers cannot retrieve proof files. If metadata exists but the file is missing, retrieval returns HTTP `410`.

Uploading proof does not change `Shipment.status`. However, the upload handler currently writes `status=DELIVERED` on its audit entry regardless of the actual shipment status. That entry is **not reliable evidence of delivery completion** and can produce a misleading customer timeline. NEXT-02 below describes the required correction.

Sources: [notes endpoint](../src/app/api/shipments/[trackingCode]/notes/route.ts), [proof upload endpoint](../src/app/api/shipments/[trackingCode]/proof/route.ts), [proof retrieval endpoint](../src/app/api/shipments/[trackingCode]/proof/[proofId]/route.ts), and [proof storage](../src/lib/delivery-proof-storage.ts).

## 6. Driver handover — BL-06

**Status: Implemented for relationship validation and duplicate event handling.**

A handover requires an existing shipment, two different existing drivers, and a valid timestamp. The outgoing driver must be the shipment's current driver. An admin or that driver can initiate the direct action.

A successful handover changes the assigned driver, sets acceptance back to `PENDING`, preserves shipment status, and records both the audit event and processed handover event in one transaction. Replaying the same valid event ID returns the stored result without reassigning the shipment or adding another audit entry. Business rejections are retained with a reason; malformed API payloads are rejected before domain processing.

The direct action processes the handover locally before sending the optional n8n webhook notification. A notification failure is reported separately and does not undo an already committed handover. The integration callback requires its configured secret and uses the event ID to avoid applying the same event again. This does not provide general duplicate-request protection to every other mutation endpoint.

Current handover checks do not enforce receiving-driver availability or prevent handovers after delivery. New direct requests generate new event IDs, so callers should not treat a fresh direct request as a replay of an earlier event.

Sources: [handover processing](../src/lib/handover.ts), [direct handover endpoint](../src/app/api/shipments/[trackingCode]/handover/route.ts), and [integration endpoint](../src/app/api/integrations/handover/route.ts). See [the handover contract](handover.md) for payload formats and integration configuration.

## 7. Tracking, ETA, and alerts — BL-07

**Status: Implemented for telemetry and monitoring signals; partial for delivery prediction.**

GPS ingestion appends a position without changing shipment status or the shipment's `updatedAt`. Coordinates must be within valid latitude/longitude ranges. Optional speed must be between 0 and 120 mph, and optional heading must be an integer from 0 to 359 degrees. A supplied timestamp must be a valid datetime or the request is rejected; if omitted, the server uses the current time. There is no check yet for future timestamps or repeated telemetry events.

| Signal | Current rule | Interpretation |
|---|---|---|
| Shipment exception | `status=EXCEPTION` | The shipment needs operational review. |
| Stale shipment update | `status=IN_TRANSIT` and `updatedAt` is more than 24 hours old | No recent change to the shipment row; not a promised-arrival breach. |
| Stale GPS feed | Latest ping age, rounded down to whole minutes, is greater than 30 | The stale state begins at 31 elapsed minutes in the current implementation. |
| Completed map state | `status=DELIVERED` | Takes precedence over exception/stale feed presentation. |
| Exception map state | `status=EXCEPTION` | Takes precedence over stale feed presentation. |

The live map includes facility-based shipments even when they have no location pings. An undelivered shipment without telemetry is displayed at its origin, and a delivered shipment without telemetry is displayed at its destination. New shipments always receive an initial origin ping. A no-ping shipment is not counted as a stale GPS feed. A fresh ping does not clear the separate 24-hour shipment-update alert. Conversely, changing a note or assignment can refresh `updatedAt` without moving the shipment forward.

Route progress uses straight-line geographic distance to the destination, not road routing. Undelivered shipments are capped at 99% progress; `DELIVERED` produces 100%. The map displays stored `estimatedArrival` values rather than recalculating them from speed or traffic. The ordinary shipment/customer view currently displays status labels such as `Not scheduled` instead of the stored ETA. An `on-track` map label therefore does not establish that a delivery will meet its promised time.

Sources: [GPS ingestion](../src/app/api/tracking/pings/route.ts), [live tracking calculations](../src/lib/tracking.ts), and `getShipmentAlerts` in [data.ts](../src/lib/data.ts).

## 8. Audit history and operational advice — BL-08

**Status: Implemented for transactional audit writes; partial for stronger history guarantees.**

Shipment creation, assignment, assignment responses, notes, status changes, handovers, and proof metadata writes record an audit event in the same transaction as their related database change. A failed database transaction must not leave half of that operation committed. Proof files are written separately, with cleanup attempted if the metadata transaction fails.

Normal application actions append audit rows; there is no user-facing audit-edit action. This is an application convention, not database-enforced immutable storage. Availability updates and GPS pings are not shipment status transitions and do not currently write `StatusLog` entries. A transaction alone also does not guarantee that two simultaneous requests cannot overwrite a decision made from stale state.

The admin copilot reads an operational snapshot and produces advice. Its endpoint does not assign drivers, complete deliveries, or change shipment records. Its recommendations do not count as business actions or delivery evidence. Historical dataset metrics and current operational shipments must be identified separately when interpreting reports.

Sources: [shipment actions](../src/lib/data.ts), [handover actions](../src/lib/handover.ts), [copilot endpoint](../src/app/api/copilot/route.ts), and [data model overview](data-and-database.md).

## 9. Additional business rules to implement

**All rules in this section are proposed, not currently enforced in full.** Priorities describe a suggested implementation order. Thresholds inherited from the agent guide are policy targets, not active application settings. A dispatcher means an admin performing dispatch duties; there is no separate dispatcher role today.

### Priority 1: delivery correctness

| ID | Proposed business rule | Conditions and expected outcome |
|---|---|---|
| NEXT-01 | Require proof before completion | Before `IN_TRANSIT -> DELIVERED`, require at least one valid, retrievable proof belonging to the shipment. Apply the rule to admins and drivers. On success, record a dedicated delivery timestamp with the status change and audit event; on failure, leave status and history unchanged. |
| NEXT-02 | Keep evidence events distinct from delivery | A proof upload must record the actual shipment status and an explicit upload event type. Customer timelines must distinguish uploads from real status changes. Uploading evidence alone must never display a delivered event. |
| NEXT-03 | Require an accepted assignment before dispatch | Require a non-null driver and `assignmentStatus=ACCEPTED` before any actor dispatches a shipment or moves it into transit, including recovery from an exception. The unassigned `ACCEPTED` storage convention must not satisfy this rule. |
| NEXT-04 | Enforce availability when assigning new work | Creation with a driver, reassignment, handover, and acceptance must reject an `UNAVAILABLE` driver. Marking a driver unavailable must retain existing assignments for explicit admin review rather than silently removing them. Capacity limits require a separately defined workload policy. |
| NEXT-05 | Protect completed delivery records | Block ordinary driver edits, reassignment, and handovers for delivered shipments. Admin corrections must use a dedicated action with a mandatory reason and a new audit entry, preserving original evidence and delivery time. |
| NEXT-06 | Require exception and recovery reasons | Entering `EXCEPTION` requires a category and nonempty explanation. Resuming work requires a resolution note. Record who reported/resolved the issue and when; publish only a customer-safe description. |

### Priority 2: operational monitoring and reliability

| ID | Proposed business rule | Conditions and expected outcome |
|---|---|---|
| NEXT-07 | Check the destination geofence | Completion requires a recent GPS position within the configured destination radius. Missing/stale GPS or missing destination coordinates must produce an explicit validation failure. Radius, acceptable ping age, and an audited admin exception policy must be defined before rollout. |
| NEXT-08 | Escalate delivery risks | Use the agent-guide targets: delays exceeding 15 minutes and route deviations exceeding 10 km require admin attention; breakdowns, inaccessible routes, unavailable recipients, and safety incidents require prompt reporting. Delay needs a stored promised deadline; deviation needs a planned route, not the current straight-line progress calculation. Persist alert acknowledgment and suppress repeated notifications for the same unresolved condition. |
| NEXT-09 | Verify driver and vehicle readiness | Require a recorded pre-shift inspection, an assigned operational vehicle, and active GPS before delivery work starts. Drivers must not operate an unassigned vehicle. Live vehicle assignments, inspections, and incident records need dedicated data models; historical dataset rows are not a substitute. |
| NEXT-10 | Validate telemetry timing and identity | Reject timestamps beyond a configured future tolerance; preserve legitimate delayed pings without replacing a newer latest position. Repeated provider event IDs must not create duplicate pings. Detect active shipments that never send their first ping. |
| NEXT-11 | Prevent conflicting or duplicate actions | Recheck ownership, acceptance, and expected status/version when committing. If another request changed them, return a conflict instead of overwriting newer state. Add explicit request keys where retries could create duplicate shipments, uploads, or audit events; reuse with a different payload must fail. |
| NEXT-12 | Measure delivery performance from business events | Use a dedicated delivery time and stored promised deadline for on-time performance. Track status activity separately from generic row updates so a note cannot reset the operational inactivity clock. Separate synthetic GPS demonstrations and historical dataset metrics from live operational KPIs. |

Cancellation, returns, invoicing, refunds, write-offs, and partial delivery remain outside the current lifecycle. The implemented payment ledger records externally received amounts against an optional shipment charge, but it does not process cards or generate invoices. These broader finance workflows need separate states, authorization rules, and acceptance criteria.

## 10. Acceptance scenarios

These are specifications for future automated or manual checks, not a record of passing tests. Current scenarios describe existing code paths; target scenarios must become regression tests when their proposed rules are implemented.

| Scenario | Coverage | Expected result |
|---|---|---|
| Admin or Sales creates a shipment using the same origin and destination facility | Current: BL-02 | Reject; no shipment, audit, or GPS row. |
| Admin or Sales selects an unknown facility or a customer ID belonging to a driver | Current: BL-02 | Reject the invalid reference. |
| Customer requests another customer's tracking code | Current: BL-01 | Return `404`; disclose no shipment details. |
| Assigned driver changes status before accepting | Current: BL-03/04 | Return `403`; status and audit history remain unchanged. |
| Driver rejects a pending assignment | Current: BL-04 | Clear the assigned driver, retain shipment status, and append the rejection audit entry. |
| Driver responds to an already accepted assignment | Current: BL-04 | Return `409`; do not create a second response event. |
| Sales user creates a shipment with no driver ID | Current: BL-02 | Create a `PENDING` shipment with an origin ping and charge. |
| Sales user attempts to assign a driver | Current: BL-01/02 | Return `403`; no shipment is created. |
| Admin records a 25 USD cash payment followed by the remaining 100 USD by bank transfer on a 125 USD charge | Current: payment ledger | The ledger moves from partial to paid and the balance reaches zero. |
| Authorized actor skips from `PENDING` directly to `DELIVERED` | Current: BL-03 | Return `422`; no status change. |
| Driver uploads an oversized proof or a file with a mismatched type signature | Current: BL-05 | Return `413` or `415`, respectively; no proof metadata or upload audit event. |
| Integration receives the same valid, already processed handover event twice | Current: BL-06 | Return the stored result on replay; exactly one reassignment and handover audit event. |
| An in-transit shipment has a fresh GPS ping but a shipment row unchanged for over 24 hours | Current: BL-07 | The shipment-update alert remains; the GPS feed is not stale. |
| An in-transit shipment has a latest ping aged 30 minutes 59 seconds, then 31 minutes | Current: BL-07 | Not stale at the first boundary; stale at the second. |
| Actor marks a shipment delivered with no usable proof | Target: NEXT-01 | Reject without changing status, delivery timestamp, or history. |
| Proof is uploaded while the shipment is in transit | Target: NEXT-02 | Record an upload event with the actual status; no delivered customer event. |
| Admin dispatches an unassigned or unaccepted shipment | Target: NEXT-03 | Reject until a driver has accepted. |
| Admin assigns or hands over work to an unavailable driver | Target: NEXT-04 | Reject without changing the existing assignment. |
| Driver edits or hands over a delivered shipment | Target: NEXT-05 | Reject; preserve the completed record. |
| Actor enters an exception without a reason or resumes without a resolution note | Target: NEXT-06 | Reject; preserve the previous state. |
| Delivery completion is requested outside the configured geofence or with stale GPS | Target: NEXT-07 | Reject and explain the failed prerequisite. |
| Repeated monitoring checks find the same undelivered shipment more than 15 minutes past its promised deadline | Target: NEXT-08 | Keep one unresolved alert with acknowledgment tracking; suppress repeated notifications. |
| Driver starts work without a recorded inspection or assigned operational vehicle | Target: NEXT-09 | Reject and identify the missing readiness requirement. |
| A provider repeats a telemetry event ID or supplies a timestamp beyond the configured future tolerance | Target: NEXT-10 | Do not duplicate the first event; reject the future-dated event. |
| Two requests update the same shipment using the same expected version | Target: NEXT-11 | At most one succeeds; the other reports a conflict without a misleading audit entry. |
| A note is added to an operationally inactive shipment | Target: NEXT-12 | Retain the inactivity alert and original delivery metrics; a note is not delivery progress. |

For each new rule, update its implementation status here only after the server-side check and relevant acceptance scenarios are verified. Keep endpoint payload details in their dedicated documents and link back to the applicable business rule.
