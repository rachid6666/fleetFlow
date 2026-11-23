# Live GPS tracking and AI operations copilot

## Live telemetry

`ShipmentLocationPing` stores latitude, longitude, speed, heading, source, and timestamp for a shipment. Shipment coordinates and `estimatedArrival` provide route progress and ETA context.

No demo shipments or synthetic GPS trails are created by the seed. Real shipments are created from U.S. storage facilities in Neon, and telemetry enters through the tracking API or an approved integration.

The admin overview polls `/api/tracking/live` every 10 seconds and renders the latest position, trail, progress, remaining miles, ETA, and stale-feed state.

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

Admins can add pings to any shipment. Drivers can add pings only to shipments assigned to their authenticated email. GPS writes do not mutate shipment status, so status and audit rules remain unchanged.

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

For local UI verification, start the app, open `/admin`, and confirm that the GPS map shows seven routes. Then open `/admin/copilot` and ask: `What needs immediate attention right now?`