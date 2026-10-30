# FleetFlow access concept

## Four questions

### 1. Who is asking?

FleetFlow uses two operational roles for this access concept:

- **Admin** — the operations team. An admin may view every shipment and update any shipment.
- **Driver** — a limited operational user. A driver may view only shipments assigned to the driver name in the authenticated session and may update only those shipments.

Customer tracking is intentionally public and read-only by tracking code. It is not an operational role for the protected shipment list or mutation API.

### 2. What is being requested?

The request is identified by the HTTP method and route:

- `GET /api/shipments` requests the operational shipment list.
- `GET /api/shipments/:trackingCode` requests one public tracking view.
- `PATCH /api/shipments/:trackingCode` requests a status or delivery-note change.
- `GET /api/superset/guest-token` requests a short-lived analytics token.
- `GET /api/health` checks service health.

### 3. Which data is in scope?

The server decides the scope before returning or changing data. Admins receive the full demo shipment list. Drivers receive only records whose `driverName` matches `session.user.name`; this is the demo equivalent of filtering by a future `driverId` foreign key. A tracking-code lookup returns only the requested public shipment record. No client-side filter is treated as an authorization check.

### 4. Which rule decides?

The route handler calls the server-side access helper in [`src/lib/access.ts`](../src/lib/access.ts). Missing sessions return `401`. Authenticated users without the required role or assignment return `403`. The driver filter and assignment check run in the backend route before data is returned or mutated. Database-backed production code must preserve the same rule in its Prisma `where` clause and update transaction.

## Endpoint test plan

Replace the placeholder cookies or bearer mechanism with a real authenticated session from the local Authentik setup. Every protected endpoint has an allowed and forbidden case. The examples use quoted URLs as required.

| Endpoint | Allowed call and expected status | Forbidden call and expected status |
| --- | --- | --- |
| `GET /api/health` | `curl -i "http://localhost:3000/api/health"` → `200` | `curl -i -X POST "http://localhost:3000/api/health"` → `405` (unsupported method) |
| `GET /api/shipments` | Admin session: `curl -i -b "admin-session-cookie" "http://localhost:3000/api/shipments"` → `200` | No session: `curl -i "http://localhost:3000/api/shipments"` → `401`; customer session → `403` |
| `GET /api/shipments` limited scope | Driver session for Nadia Benali: `curl -i -b "driver-session-cookie" "http://localhost:3000/api/shipments"` → `200`, with only Nadia's shipments | Driver session for another driver must not receive Nadia's records; expected `200` with those records omitted. A customer session → `403` |
| `GET /api/shipments/:trackingCode` | Public tracking: `curl -i "http://localhost:3000/api/shipments/FF-2048-AL"` → `200` | Unknown tracking code: `curl -i "http://localhost:3000/api/shipments/DOES-NOT-EXIST"` → `404` |
| `PATCH /api/shipments/:trackingCode` | Assigned driver or admin: `curl -i -X PATCH -b "driver-session-cookie" -H "Content-Type: application/json" -d "{\"status\":\"IN_TRANSIT\"}" "http://localhost:3000/api/shipments/FF-2049-AL"` → `200` when assigned and transition is valid | Unassigned driver/customer: same call with the other session → `403`; no session → `401` |
| `GET /api/superset/guest-token` | Authenticated admin or driver: `curl -i -b "admin-session-cookie" "http://localhost:3000/api/superset/guest-token"` → `200` when Superset is configured, otherwise `503` | No session: `curl -i "http://localhost:3000/api/superset/guest-token"` → `401` |
| `/api/auth/[...nextauth]` | Exercise through the Authentik login flow; callback is environment-dependent | Direct unauthenticated operational API calls must still be rejected; this route itself is the authentication plumbing, so manual login-flow verification is required |

## What is open

The API currently uses an in-memory demo store and Authentik session claims. The final production test still needs:

1. A seeded admin and two driver accounts in Authentik.
2. A real browser session cookie for each role.
3. A Prisma query that filters by ` `, not the demo `driverName` string.
4. CI coverage for the `401`, `403`, allowed, and cross-driver data-leak cases.

Until those are available, the curl commands above are the executable test draft and the environment-dependent rows are marked by their expected conditional status.

## Environment safety

- `.env` and `.env.*` are ignored by Git.
- `.env.example` is the committed template and contains placeholders only.
- Never put Authentik secrets, database passwords, session secrets, or Superset service credentials in tracked files.
