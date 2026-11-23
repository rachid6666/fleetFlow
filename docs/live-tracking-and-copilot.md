# Live GPS tracking and AI operations copilot

## Live telemetry

`ShipmentLocationPing` stores latitude, longitude, speed, heading, source, and timestamp for a shipment. Shipment coordinates and `estimatedArrival` provide route progress and ETA context.

Shipment creation writes an initial origin ping. Facility-based shipments created before telemetry existed are also included by the live tracking query. An undelivered no-ping shipment is placed at its origin, and a delivered no-ping shipment is placed at its destination. These fallback positions do not count as stale GPS feeds.

`npm run db:seed:tracking` explicitly refreshes seven `FF-LIVE-*` synthetic demonstration shipments and 118 GPS pings. The command is idempotent, updates only its fixed synthetic tracking codes, and deletes/recreates only pings whose source is `synthetic`. Real telemetry enters through the tracking API or an approved integration.

The admin overview and Sales dashboard use `/api/tracking/live`, which is available to `ADMIN` and `SALES` sessions. The map renders latest position, trail, progress, remaining miles, ETA, and stale-feed state.

## GPS ingestion

`POST /api/tracking/pings` accepts:

```json
{
  "trackingCode": "FF-20261123-ABCD1234",
  "latitude": 33.1,
  "longitude": -86.4,
  "speedMph": 58.2,
  "headingDegrees": 74,
  "recordedAt": "2026-11-16T16:00:00.000Z",
  "source": "telematics"
}
```

Admins can add pings to any shipment. Drivers can add pings only to shipments assigned to their authenticated email. Sales and customer sessions cannot write GPS data. GPS writes do not mutate shipment status, so status and audit rules remain unchanged.

## AI operations copilot

Open `/admin/copilot`. The route is admin-only. The server builds a compact snapshot containing live shipment summaries, status counts, historical revenue, delivery punctuality, safety totals, active trucks, major routes, facilities, and recent audit events.

The model receives that snapshot plus the user question. It does not receive database credentials, customer contact details, driver personal data, or internal notes. Responses are instructed to use only supplied data and state when data is unavailable.

Local Ollama is the default provider:

```env
OLLAMA_BASE_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="qwen3:4b"
OLLAMA_FALLBACK_MODEL="gemma4:12b"
```

The copilot prefers installed local Qwen first, then checks other local models and optional cloud models. If both models are unavailable, it returns a rules-based operational snapshot rather than failing the page. When FleetFlow runs in Docker Compose, use `OLLAMA_BASE_URL=http://host.docker.internal:11434` so the container can reach Ollama on the host.

## Verification

```powershell
npm run typecheck
npm run db:verify:kaggle
```

For local UI verification, start the app, run `npm run db:seed:tracking`, open `/admin`, and confirm that the live map shows the seven synthetic routes. Create a regular shipment and confirm it appears at its origin without waiting for telemetry. Sign in with a Sales account and confirm `/sales` can read the same live tracking API but cannot post GPS pings. Then open `/admin/copilot` as an admin and ask `What needs immediate attention right now?`