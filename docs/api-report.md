# FleetFlow API Report

## 1. Purpose and architecture

FleetFlow exposes application APIs through Next.js App Router route handlers under `src/app/api/`. The API layer is served by the same process as the web application.

- Authentication and authorization use Auth.js with Authentik as the OIDC provider.
- Session role claims are `ADMIN`, `DRIVER`, or `CUSTOMER`.
- Prisma provides PostgreSQL access.
- PostgreSQL is hosted externally in Neon; Docker runs the application and n8n but no local PostgreSQL container.
- n8n integrates shipment handovers and team notifications.
- Superset provides embedded analytics and guest dashboard tokens.
- Ollama provides the local AI operations copilot with a rule-based fallback.

Base URL for local use:

```text
http://localhost:3000
```

Compose services communicate with each other by service name. Browser-facing callbacks use `localhost`.

## 2. Authentication API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET`, `POST` | `/api/auth/*` | Public | Auth.js/OIDC sign-in, callback, CSRF, session, and provider handlers |
| `GET` | `/api/auth/logout` | Authenticated browser users | Clears Auth.js cookies and starts the Authentik invalidation flow |

### Authentik/OIDC flow

1. FleetFlow redirects the browser to Authentik.
2. Authentik authenticates the user and returns a profile and groups claim.
3. Auth.js maps `FleetFlow Admins` to `ADMIN`, `FleetFlow Drivers` to `DRIVER`, and all other users to `CUSTOMER`.
4. `/workspace` redirects the session to `/admin`, `/driver`, or `/customer`.

The OIDC authorization request includes `openid`, `email`, `profile`, and `groups`. FleetFlow does not accept a password directly through the application API.

## 3. General API conventions

- Authenticated routes use `auth()` and the session role.
- JSON APIs use Next.js `NextResponse.json`.
- Request bodies are validated with Zod.
- Invalid JSON normally returns HTTP `400`.
- Missing authentication normally returns HTTP `401`.
- Role or ownership failures normally return HTTP `403`.
- Missing records normally return HTTP `404`.
- Database or external-service failures may return HTTP `502`, `503`, or `410` where applicable.
- Mutations that create records commonly return HTTP `201`.
- Role ownership is checked against the signed-in email or customer/driver relation where applicable.

## 4. Shipment APIs

### Shipment collection

| Method | Endpoint | Access | Request | Success |
|---|---|---|---|---|
| `GET` | `/api/shipments` | Authenticated | None | `200` with `{ data, count }` |
| `POST` | `/api/shipments` | Admin | JSON shipment details | `201` with `{ data }` |

`GET /api/shipments` returns all shipments for admins, assigned shipments for drivers, and owned shipments for customers.

Example `POST` body:

```json
{
  "originBranchId": "branch-id",
  "destinationBranchId": "branch-id",
  "customerId": "customer-id",
  "driverId": "driver-id",
  "notes": "Handle with care"
}
```

`originBranchId` and `destinationBranchId` must be different. Notes are limited to 2,000 characters.

### Individual shipment

| Method | Endpoint | Access | Request | Success |
|---|---|---|---|---|
| `GET` | `/api/shipments/:trackingCode` | Authenticated | Tracking code in path | `200` with `{ data }` |
| `PATCH` | `/api/shipments/:trackingCode` | Admin or assigned driver | JSON status change | `200` with `{ data, audit }` |

Status values:

- `PENDING`
- `DISPATCHED`
- `IN_TRANSIT`
- `DELIVERED`
- `EXCEPTION`

Example `PATCH` body:

```json
{
  "status": "IN_TRANSIT",
  "notes": "Departed the origin facility"
}
```

### Assignment APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `PATCH` | `/api/shipments/:trackingCode/assignment` | Admin | Assign or unassign a driver |
| `PATCH` | `/api/shipments/:trackingCode/assignment-response` | Assigned driver | Accept or reject an assignment |

Assignment request:

```json
{"driverId":"driver-id"}
```

Use `null` to remove the current driver assignment.

Assignment response:

```json
{"assignmentStatus":"ACCEPTED"}
```

Valid response values are `ACCEPTED` and `REJECTED`. A second response to an already-resolved assignment returns HTTP `409`.

### Delivery notes

| Method | Endpoint | Access | Request |
|---|---|---|---|
| `PATCH` | `/api/shipments/:trackingCode/notes` | Admin or assigned accepted driver | Delivery note and optional location |

```json
{
  "notes": "Delivered to the receiving department",
  "location": "Loading bay 3"
}
```

Notes are limited to 2,000 characters. Location is limited to 200 characters.

### Delivery proofs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/shipments/:trackingCode/proof` | Admin or assigned accepted driver | Multipart PDF/JPG/PNG upload |
| `GET` | `/api/shipments/:trackingCode/proof/:proofId` | Admin or assigned accepted driver | Retrieve an uploaded proof |

Multipart field name: `file`

Rules:

- Maximum size: 10 MB.
- MIME types: PDF, JPEG, and PNG.
- MIME and file signature must match.
- The proof is stored in `.fleetflow/proof-of-delivery/` in the current local implementation.
- PostgreSQL stores proof metadata and shipment association.
- Customer users cannot upload or retrieve proof files.
- Returned proof URLs/files do not expose them to unauthenticated users.

## 5. Tracking APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/tracking/live` | Admin | Live shipment telemetry and summary |
| `POST` | `/api/tracking/pings` | Admin or assigned driver | Record a GPS ping |

GPS ping body:

```json
{
  "trackingCode": "FF-LOCAL-001",
  "latitude": 36.753800,
  "longitude": 3.058800,
  "speedMph": 42,
  "headingDegrees": 90,
  "recordedAt": "2026-11-22T18:00:00.000Z",
  "source": "api"
}
```

Validation:

- Latitude: `-90` to `90`
- Longitude: `-180` to `180`
- Speed: `0` to `120` mph
- Heading: integer `0` to `359`
- Timestamp: valid ISO 8601 date-time
- Source: `1` to `50` characters

Drivers may create pings only for their assigned shipment.

## 6. Handover APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/shipments/:trackingCode/handover` | Authenticated Admin or assigned Driver | Initiate a shipment handover |
| `POST` | `/api/integrations/handover` | n8n integration secret | Process a handover event idempotently |

Direct handover body:

```json
{
  "to_driver_id": "local-driver-two",
  "timestamp": "2026-11-22T18:00:00.000Z"
}
```

Integration handover body:

```json
{
  "event_id": "handover-example",
  "shipment_id": "shipment-id",
  "from_driver_id": "driver-id",
  "to_driver_id": "next-driver-id",
  "timestamp": "2026-11-22T18:00:00.000Z"
}
```

The integration route requires:

```text
x-fleetflow-webhook-secret: <N8N_WEBHOOK_SECRET>
```

The event ID is the idempotency key. Repeated events do not create duplicate shipment updates. The first processed event updates the assigned driver and creates audit information in a transaction.

## 7. Operations copilot API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/copilot` | Admin | Ask the operations copilot a grounded logistics question |

Request:

```json
{"question":"Which shipments need attention?"}
```

Response:

```json
{
  "answer": "Operations summary",
  "model": "qwen3:4b",
  "generatedAt": "2026-11-22T18:00:00.000Z",
  "databaseAvailable": true
}
```

The route:

- Builds an operations snapshot from live and historical database data.
- Calls an Ollama chat model.
- Tries configured local/fallback models.
- Returns `rules-fallback` with concise operational recommendations when Ollama is unavailable.
- Uses a system prompt requiring answers to come from the supplied snapshot and forbidding fabricated shipment data.

## 8. Superset analytics API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/superset/guest-token` | Admin | Obtain a guest token for a Superset dashboard |
| `GET` | `/api/superset/guest-token?dashboard=analytics` | Admin | Obtain a guest token for the analytics dashboard |

The route logs into Superset using service credentials, obtains a CSRF session, and requests a dashboard guest token. Missing configuration returns HTTP `503`; Superset authentication or upstream failures return HTTP `502`.

## 9. Health API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | Check application and database availability |

Success response:

```json
{
  "service": "fleetflow",
  "status": "ok",
  "database": "ok"
}
```

If PostgreSQL is unavailable, the route returns HTTP `503`:

```json
{
  "service": "fleetflow",
  "status": "error",
  "database": "unavailable"
}
```

## 10. n8n and external integration surfaces

### n8n workflows

The project exports two workflows:

1. `fleetflow-handover.json`
   - Receives a server-side handover event.
   - Calls `POST /api/integrations/handover`.
   - Sends `x-fleetflow-webhook-secret`.
2. `fleetflow-team-activity.json`
   - Handles explicit `START_TASK` events and GitHub push/pull-request events.
   - Optionally forwards normalized activity to `TEAM_NOTIFICATION_WEBHOOK_URL`.

### External service dependencies

| Dependency | Base URL/configuration | Use |
|---|---|---|
| Authentik | `AUTHENTIK_ISSUER` | OIDC authentication and role claims |
| Neon PostgreSQL | `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Application data and Prisma migrations |
| n8n | `FLEETFLOW_API_URL`, `FLEETFLOW_HANDOVER_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` | Workflow callbacks and integration events |
| Superset | `SUPERSET_SERVER_URL`, `SUPERSET_USERNAME`, `SUPERSET_PASSWORD` | Analytics login and embedded guest tokens |
| Ollama | `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_FALLBACK_MODEL` | Local operations copilot |

## 11. Role permissions

| Capability | Admin | Driver | Customer |
|---|---|---|---|
| List all shipments | Yes | Assigned only | Owned only |
| Create shipments | Yes | No | No |
| Change shipment status | Yes | Assigned accepted only | No |
| Assign/reassign driver | Yes | No | No |
| Accept/reject assignment | No | Yes, assigned only | No |
| Add delivery notes | Yes | Assigned accepted only | No |
| Upload/retrieve delivery proof | Yes | Assigned accepted only | No |
| Record GPS ping | Yes | Assigned only | No |
| View live tracking | Yes | No | No |
| Use operations copilot | Yes | No | No |
| Obtain Superset guest token | Yes | No | No |
| Enter tracking code | Not customer role | Not customer role | Yes, owned only |
| Initiate handover | Yes, any shipment | Assigned shipment only | No |

## 12. Customer tracking behavior

The customer portal now provides a tracking-code lookup rather than a general shipment list or export.

- The customer must be authenticated.
- The tracking code is normalized to uppercase.
- Codes accept letters, numbers, and hyphens.
- The server verifies that the shipment's `customerId` matches the signed-in customer email.
- Invalid codes receive a validation response.
- A code assigned to another customer is not disclosed to the requesting customer.
- The returned view contains route, status, estimated arrival, last update, and customer-safe timeline events.

## 13. Security observations

1. API mutations verify both role and shipment ownership where relevant.
2. Zod schemas reject malformed JSON and unexpected fields.
3. The n8n integration route uses a shared secret and should always have `N8N_WEBHOOK_SECRET` set in deployed environments.
4. Superset credentials remain server-side and are exchanged for short-lived guest tokens.
5. Proof uploads validate declared MIME type and file signature.
6. Secrets must remain in ignored environment files or hosted secret configuration.
7. The current proof storage implementation is local filesystem storage and should be replaced with object storage for production.
8. The integration handover event uses a database unique ID for idempotency.
9. Public health access is appropriate, but operational data routes must remain authenticated.
10. Customer tracking is ownership-filtered server-side, not only hidden by UI.

## 14. Recommended API improvements

- Add an OpenAPI/Swagger specification and generated API documentation.
- Add machine-readable request and response schemas for all route handlers.
- Add rate limiting to authentication-adjacent, handover, tracking, and proof endpoints.
- Add automated API contract tests for role and ownership boundaries.
- Add correlation/request IDs to mutation and integration logs.
- Define and document consistent pagination and filtering for future collection endpoints.
- Replace local delivery-proof storage with authenticated object storage.
- Add API versioning before exposing external integrations beyond n8n.
- Rotate and store the n8n shared secret in a hosted secret manager.
- Add explicit replay/proof protection and expiry for integration events.
