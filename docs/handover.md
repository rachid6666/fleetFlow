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

`event_id` is the idempotency key and is unique in `HandoverEvent.eventId`. A repeat returns the existing result and does not update `Shipment` or add another `StatusLog`. A valid first event updates `Shipment.driverId` and creates a `StatusLog` in one Prisma transaction. The log keeps the current `Shipment.status` and describes the driver handover, so the status timeline remains auditable without inventing a status transition. Rejected events are retained in `HandoverEvent` with `status=REJECTED` and `errorReason`.

Data access: Admins can access all shipment and handover data through the existing admin routes. Drivers can access their own assignments and can act only on an assigned shipment. Customers remain excluded from mutation endpoints. Public `GET /api/shipments/:trackingCode` exposes tracking-safe fields and `StatusLog` timeline entries, not driver IDs or internal handover fields.

## Team activity

Flow: explicit FleetFlow start-task action or GitHub push/pull-request webhook → n8n `fleetflow/team-activity` webhook → optional `TEAM_NOTIFICATION_WEBHOOK_URL` → team notification service.

Accepted event types are `START_TASK`, `github_push`, and `github_pull_request`. A start-task event is explicit because GitHub cannot see uncommitted local work. Use the n8n webhook with a body such as:

```json
{"event_type":"START_TASK","actor":"Yahia","repository":"FleetFlow","title":"Implement handover workflow"}
```

GitHub sends the push or pull-request body and `x-github-event`; the workflow normalizes it to the accepted event type. Invalid events return HTTP 422 and a visible reason. When `TEAM_NOTIFICATION_WEBHOOK_URL` is empty, the workflow returns HTTP 200 with `notified:false`; local FleetFlow startup is not blocked. A team-wide GitHub webhook requires a reachable shared n8n instance. A teammate's local n8n is only local and cannot receive GitHub callbacks from the public GitHub service.

## n8n import and credentials

Import `workflows/fleetflow-handover.json` and `workflows/fleetflow-team-activity.json` from the n8n UI (`Workflows` → `Import from File`). In the local n8n container, set `FLEETFLOW_API_URL=http://app:3000`, `N8N_WEBHOOK_SECRET` to the matching local `.env` value, and optionally `TEAM_NOTIFICATION_WEBHOOK_URL`. These are n8n environment variables, not embedded workflow credentials. Do not paste secrets into exported JSON or commit n8n's `.n8n` data volume.

Use each workflow's Test URL while testing and Production URL after activation. The Compose service names are `app`, `postgres`, and `n8n`; `localhost` is for the host browser only.
