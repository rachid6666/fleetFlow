# FleetFlow access concept

## Workspace routing

FleetFlow uses the Authentik role claim to route each signed-in user to one workspace:

- **Admin** ? `/admin`
- **Driver** ? `/driver`
- **Customer** ? `/customer`

Visiting another role's workspace redirects the user to their own workspace. Signed-out users are redirected to `/login`. The old `/track` route redirects to the authenticated customer workspace.

## Data scope

### Admin

Admins can view every shipment, driver availability, operational analytics, live GPS data, handover records, and the AI operations copilot.

### Driver

Drivers can view only shipments assigned to the database user whose email matches `session.user.email`. The same ownership rule is applied to status changes, notes, delivery proofs, assignment responses, availability updates, and GPS ingestion. The driver workspace never loads the full driver directory.

### Customer

Customers can view only shipments whose `Shipment.customer` email matches `session.user.email`. Their API response contains tracking code, route, status, ETA, and a customer-safe event timeline. It omits internal notes, driver identities, delivery-proof metadata, proof files, and mutation endpoints.

## Backend enforcement

Authorization is enforced in the server query, not by a client-side filter:

- Page routes check the role on the server.
- `src/middleware.ts` redirects users who open another role's workspace.
- `src/app/admin/layout.tsx` independently verifies the admin role.
- Driver queries filter by the signed-in driver email.
- Customer queries filter by the signed-in customer email.
- The shipment-detail API uses `getShipmentForActor`, which applies the role-specific `where` clause.
- Mutation APIs reject customers and check assignment ownership for drivers.

## Endpoint behavior

| Endpoint | Admin | Driver | Customer |
|---|---|---|---|
| `GET /api/shipments` | All shipments | Assigned shipments | Own safe shipment views |
| `GET /api/shipments/:trackingCode` | Any shipment | Assigned shipment | Own shipment only; otherwise `404` |
| `PATCH /api/shipments/:trackingCode` | Allowed | Assigned and accepted only | `403` |
| Notes and delivery proof | Allowed | Assigned and accepted only | `403` |
| `GET /api/tracking/live` | Allowed | `403` | `403` |
| `POST /api/tracking/pings` | Allowed | Assigned shipment only | `403` |
| `POST /api/copilot` | Allowed | `403` | `403` |
| Superset analytics | Allowed | `403` | `403` |

Missing sessions return `401`. Accessing another account's record returns `404` where exposing its existence would be unnecessary.

## Verification

The production build and TypeScript checks must pass:

```powershell
npm run typecheck
npm run build
```

Seeded local-data checks confirm:

- the customer sees only shipments linked to `customer@fleetflow.local`;
- driver one sees only shipments assigned to `driver.one@fleetflow.local`;
- driver two cannot read the customer's seeded shipment;
- customer results omit internal notes and driver details;
- unauthenticated shipment APIs return `401`;
- `/track` sends signed-out users to `/login`.
