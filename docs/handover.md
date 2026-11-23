# FleetFlow handover contract

This is the authoritative interface contract for driver handovers and team activity. The application names below match the current Prisma schema and route code.

## Shipment handover

Flow: authorized Admin/Driver action in the FleetFlow UI or API → n8n `fleetflow/shipment-handover` webhook → FleetFlow `POST /api/integrations/handover` → PostgreSQL `Shipment`, `StatusLog`, and `HandoverEvent` → FleetFlow API/UI shipment and tracking views.

The direct action is `POST /api/shipments/:trackingCode/handover` and accepts:

```json
{"to_driver_id":"local-driver-two","timestamp":"2026-11-03T12:00:00.000Z"}
```

FleetFlow creates the server-side event sent to n8n:

```json
{
  "event_id":"handover_<uuid>",
  "shipment_id":"local-shipment-001",
  "from_driver_id":"local-driver-one",
  "to_driver_id":"local-driver-two",
  "timestamp":"2026-11-03T12:00:00.000Z"
}
```

The n8n workflow forwards the same fields to `POST /api/integrations/handover` with `x-fleetflow-webhook-secret`. The integration route returns `{ data, idempotent, visible }` with HTTP 200 for a processed or repeated event, HTTP 401 for a bad secret, HTTP 400 for malformed JSON/fields, and HTTP 422 with `{ error, event_id, visible: true }` for a valid-shaped event whose references or driver relationship are invalid.

Validation rules:

- `event_id`, `shipment_id`, `from_driver_id`, `to_driver_id`, and ISO-8601 `timestamp` are required.
- `from_driver_id` and `to_driver_id` must differ.
- `shipment_id` must reference `Shipment.id`.
- Both driver IDs must reference `User` rows whose `role` is `DRIVER`.
- `from_driver_id` must equal the shipment's current `Shipment.driverId`.
- The integration endpoint requires `N8N_WEBHOOK_SECRET`; the direct endpoint additionally requires an Auth.js session. Admins may hand over any shipment; Drivers may hand over only their assigned shipment.

`event_id` is the idempotency key and is unique in `HandoverEvent.eventId`. A repeat returns the existing result and does not update `Shipment` or add another `StatusLog`. A valid first event updates `Shipment.driverId`, sets `Shipment.assignmentStatus=PENDING`, and creates a `StatusLog` in one Prisma transaction. The log keeps the current `Shipment.status` and describes the driver handover, so the status timeline remains auditable without inventing a status transition. The receiving driver must accept the reassignment before changing shipment status, adding notes, or uploading delivery proof. Rejected events are retained in `HandoverEvent` with `status=REJECTED` and `errorReason`.

Data access: Admins can access all shipment and handover data through the existing admin routes. Drivers can access their own assignments and can act only on an assigned shipment. Customers remain excluded from mutation endpoints. Public `GET /api/shipments/:trackingCode` exposes tracking-safe fields and `StatusLog` timeline entries, not driver IDs or internal handover fields.

## Driver operations before handover

Driver assignment and delivery-proof actions are separate from the n8n handover event:

1. An admin assigns or reassigns a driver from the shipment desk. A new assignment is stored as `assignmentStatus=PENDING`.
2. The assigned driver reviews the route in `/driver` and calls `PATCH /api/shipments/:trackingCode/assignment-response` with either `{"assignmentStatus":"ACCEPTED"}` or `{"assignmentStatus":"REJECTED"}`.
3. Accepted assignments allow status updates, delivery notes, and proof uploads. Rejected assignments are unassigned and recorded in `StatusLog`.
4. An accepted driver can upload a PDF, JPG, or PNG proof (maximum 10 MB) with `POST /api/shipments/:trackingCode/proof`. The response returns proof metadata; authenticated users can view the file with `GET /api/shipments/:trackingCode/proof/:proofId`.

The proof file is stored in the ignored local `.fleetflow/proof-of-delivery/` directory, while PostgreSQL stores its metadata and shipment relationship. Production deployments should replace this local storage adapter with object storage while preserving the metadata and authorization contract. Uploads validate both the declared MIME type and the file signature, and drivers may access only proofs for their accepted assignments.

## Team activity

Flow: explicit FleetFlow start-task action or GitHub push/pull-request webhook → n8n `fleetflow/team-activity` webhook → optional `TEAM_NOTIFICATION_WEBHOOK_URL` → team notification service.

Accepted event types are `START_TASK`, `github_push`, and `github_pull_request`. A start-task event is explicit because GitHub cannot see uncommitted local work. Use the n8n webhook with a body such as:

```json
{"event_type":"START_TASK","actor":"Yahia","repository":"FleetFlow","title":"Implement handover workflow"}
```

GitHub sends the push or pull-request body and `x-github-event`; the workflow normalizes it to the accepted event type. Invalid events return HTTP 422 and a visible reason. When `TEAM_NOTIFICATION_WEBHOOK_URL` is empty, the workflow returns HTTP 200 with `notified:false`; local FleetFlow startup is not blocked. A team-wide GitHub webhook requires a reachable shared n8n instance. A teammate's local n8n is only local and cannot receive GitHub callbacks from the public GitHub service.

## n8n import and credentials

Import `workflows/fleetflow-handover.json` and `workflows/fleetflow-team-activity.json` from the n8n UI (`Workflows` -> `Import from File`). The exported files retain `active: false` so importing does not activate webhooks silently. Activate each workflow after import and verify it appears under both `n8n list:workflow` and `n8n list:workflow --active=true`.

Set `N8N_WEBHOOK_SECRET` to the same value in the host app and n8n container. The FleetFlow URL depends on how Next.js runs:

- Compose-hosted app and n8n use `FLEETFLOW_API_URL=http://app:3000`.
- Host-run `npm run dev` with containerized n8n uses `FLEETFLOW_API_URL=http://host.docker.internal:3000`.
- A host-run app posts to n8n with `FLEETFLOW_HANDOVER_WEBHOOK_URL=http://localhost:5678/webhook/fleetflow/shipment-handover`.
- A Compose-hosted app posts to n8n with `FLEETFLOW_HANDOVER_WEBHOOK_URL=http://n8n:5678/webhook/fleetflow/shipment-handover`.

`TEAM_NOTIFICATION_WEBHOOK_URL` is optional. When it is blank, the Team Activity workflow returns `200` with `{ ok: true, notified: false }` instead of failing.

These are environment variables, not embedded workflow credentials. Do not paste secrets into exported JSON or commit n8n's `.n8n` data volume.

Verification commands:

```powershell
docker exec no-codeproject-n8n-1 n8n list:workflow --active=true
curl.exe -i http://localhost:5678/healthz
```

For the handover test, POST a temporary event to `/webhook/fleetflow/shipment-handover`. A first valid request returns `idempotent: false`, and repeating the same event returns `idempotent: true`. Remove temporary shipment and handover-event rows afterward.
