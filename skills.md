# Reusable skills

This project includes one reusable Codex skill:

- [`skills/fleetflow-build/SKILL.md`](skills/fleetflow-build/SKILL.md) — build or extend FleetFlow with role-aware authorization, Prisma transactions, shipment audit logs, tests, and documentation updates.

The skill is self-contained and includes [`references/schema.md`](skills/fleetflow-build/references/schema.md) for data-model and transition guidance.

## Local Collins driver configuration

- **Collins Ortese (Authentik)** — username `collins.ortese.driver`, email `collins.ortese.driver@fleetflow.local`, member of `FleetFlow Drivers`.
- The matching FleetFlow Prisma user is configured with the `DRIVER` role and appears in the admin shipment driver selector.
- The driver workspace is available at `/driver`; Collins can view assigned trips, update shipment status, and add audited delivery notes.

## Driver availability configuration

- Admins configure driver availability from `/admin/drivers` in the **Drivers group**.
- Drivers can update their own availability from `/driver`; the setting is persisted on the FleetFlow Prisma user as `AVAILABLE` or `UNAVAILABLE`.
- Availability changes use the authenticated `PATCH /api/drivers/availability` endpoint. Admin requests include `driverId`; driver requests update the signed-in driver only.

## Driver assignment responses

- New driver assignments start as `PENDING` and appear in the driver workspace for review.
- Drivers accept or reject assignments from `/driver`; accepted assignments unlock status updates and delivery notes.
- Rejected assignments are unassigned and recorded in the shipment audit log. The response endpoint is `PATCH /api/shipments/:trackingCode/assignment-response`.

## Driver delivery proof

- Accepted drivers can upload PDF, JPG, or PNG delivery proof from each trip in `/driver` (maximum 10 MB).
- Proof metadata is stored with the shipment; local files are kept under the ignored `.fleetflow/proof-of-delivery/` directory.
- Proof uploads validate both MIME type and file signature, and uploads/downloads require authentication and assignment ownership.
- Uploads use `POST /api/shipments/:trackingCode/proof`; proof files are viewed through `GET /api/shipments/:trackingCode/proof/:proofId`.

## Driver delivery and customer tracking

- Accepted drivers progress assigned shipments through `IN_TRANSIT` and `DELIVERED` from `/driver`; pending or rejected assignments cannot update shipment status.
- Delivery status changes and driver notes are recorded in the shipment audit log.
- Customers track delivered shipments with the shipment tracking code at `/track?code=:trackingCode`; the tracking page displays the assigned driver and verified delivery events.
