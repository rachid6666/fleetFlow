# Database and UI data flow

## Database connections

The app uses Prisma with the existing PostgreSQL schema in [`../prisma/schema.prisma`](../prisma/schema.prisma).

- `DATABASE_URL` is Neon's pooled connection and is used by application queries.
- `DATABASE_URL_UNPOOLED` is Neon's direct connection and is used by Prisma migrations.
- `npm run db:deploy` applies checked-in migrations.
- `npm run db:validate` validates the Prisma schema.
- `npm run db:generate` regenerates the Prisma client.

Do not commit `.env` or paste database connection strings into source files. Keep the values supplied by the Neon CLI in the ignored `.env` files.

## Database topology

Docker does not run a PostgreSQL container for FleetFlow or Authentik.

| Service | Neon database | Runtime connection | Migration/direct connection |
|---|---|---|---|
| FleetFlow app and Prisma | `fleet` | `DATABASE_URL` pooled endpoint | `DATABASE_URL_UNPOOLED` direct endpoint |
| Authentik server and worker | `authentik` | `PG_HOST` pooled endpoint | `PG_DIRECT_HOST` direct endpoint |
| FleetFlow identity directory sync | `authentik` | `AUTHENTIK_DB_HOST` pooled endpoint (read-only queries) | n/a |

The two databases remain isolated even though they can live in the same Neon project. Authentik uses the direct endpoint for advisory-lock coordination and future schema upgrades. Its Compose configuration disables automatic startup migrations by default to avoid leaking a Neon advisory lock across container restarts; see [`authentik.md`](authentik.md#neon-migration-workaround).

Superset does not use a separate PostgreSQL server. Its metadata stays in the `metadata` Docker volume, while analytics queries connect to the FleetFlow `fleet` database through `superset/.env`.

## What the UI reads

Operational pages use server-side Prisma queries from [`../src/lib/data.ts`](../src/lib/data.ts). The admin dashboard, shipment desk, and tracking page are dynamically rendered so they read current database state rather than a build-time snapshot.

| Page or endpoint | Data source | Access and behavior |
|---|---|---|
| `/admin` | `loads`, `trips`, `drivers`, `trucks`, `delivery_events`, `safety_incidents` | Admin-only; live load revenue, distance, active fleet, delivery performance, and recent loads |
| `/admin` live GPS panel | `Shipment`, `ShipmentLocationPing`, related `User` | Admin-only; latest position, route trail, ETA, progress, and stale-feed state |
| `/admin/copilot` | Server-built aggregate snapshot from FleetFlow and Kaggle tables | Admin-only; grounded AI answers through local Ollama with a rules fallback |
| `/admin/shipments` | `Shipment`, `facilities`, synchronized Authentik `User` projections | Admin-only; live shipments, U.S. storage locations, drivers, customers, charges, and ETAs |
| `/admin/payments` | `Shipment`, `ShipmentPayment`, related customer `User` | Admin-only; charges, collected totals, outstanding balances, and payment recording |
| `/sales` | `Shipment`, `ShipmentPayment`, facilities, Kaggle operations data, live pings | Sales-only; shipment creation, sales/receivables summary, live tracking, and alerts |
| `/driver` | `Shipment`, signed-in driver `User` | Driver-only; shipments assigned to the signed-in account email; no full driver directory |
| `/customer` | `Shipment`, related customer `User`, `StatusLog` | Customer-only; own shipments and customer-safe timelines with internal notes and driver details omitted |
| `/track` | None | Compatibility redirect to `/customer` |
| `GET /api/health` | PostgreSQL `SELECT 1` | Reports `503` if the database cannot be reached |
| `GET /api/shipments` | `Shipment`, related `User` records | Requires a session; admins and Sales users see all, drivers see assignments, and customers see own safe views |
| `POST /api/shipments` | `Shipment`, `StatusLog`, `ShipmentLocationPing` | Admin or Sales; Sales cannot assign a driver |
| `GET /api/shipments/form-options` | `facilities`, synchronized Authentik identities | Admin or Sales |
| `GET /api/shipments/:trackingCode` | `Shipment`, `StatusLog` | Requires a session; admins and Sales see any shipment, drivers see assignments, and customers see own shipments |
| `PATCH /api/shipments/:trackingCode` | `Shipment`, `StatusLog` | Requires an admin or assigned driver; status update and audit event are one transaction |
| `GET /api/tracking/live` | `Shipment`, `ShipmentLocationPing` | Admin or Sales live fleet map data |
| `POST /api/tracking/pings` | `Shipment`, `ShipmentLocationPing` | Admin or assigned driver; appends GPS telemetry without changing shipment status |
| `POST /api/payments` | `Shipment`, `ShipmentPayment` | Admin-only append-only payment receipt |
| `POST /api/copilot` | Aggregated operational snapshot | Admin-only AI operations question |

FleetFlow's operational records are stored in `User`, `Shipment`, `StatusLog`, `ShipmentLocationPing`, and `ShipmentPayment`. Shipment origins and destinations reference the imported U.S. `facilities` table. The local `User` rows for drivers and customers are identity projections synchronized from Authentik; Sales identities remain Authentik-backed and do not require a local shipment relation. `npm run db:seed` syncs driver/customer projections and reports the available facilities.

New shipments store an initial `ShipmentLocationPing` at the origin. The live tracking query also includes facility-based shipments without pings, placing undelivered records at their origin and delivered records at their destination. `npm run db:seed:tracking` is an explicit optional command that refreshes seven marked synthetic `FF-LIVE-*` shipments and 118 GPS pings. It does not create legacy branches or placeholder identities.

## Shipment payment ledger

`Shipment.chargeAmount` is nullable for backward compatibility and stores the shipment's quoted amount in USD. `ShipmentPayment` is append-only:

- `shipmentId` links the receipt to one shipment.
- `amount` uses `DECIMAL(12,2)`.
- `currency` currently defaults to `USD`.
- `method` is `CASH`, `BANK_TRANSFER`, `CARD`, or `OTHER`.
- `reference` stores an optional external receipt or transfer reference.
- `receivedAt` records when payment was received.
- `recordedByEmail` identifies the admin who entered the ledger record.

The API derives payment state from the quoted charge and sum of receipts. It prevents overpayment when a charge is set and records external payments only. A processor integration, refunds, write-offs, and invoicing are not implemented.

## Kaggle logistics dataset

The [MIT-licensed Logistics Operations Database](https://www.kaggle.com/datasets/yogape/logistics-operations-database) is loaded into 14 typed relational tables with plain names: `customers`, `drivers`, `trucks`, `trailers`, `facilities`, `routes`, `loads`, `trips`, `fuel_purchases`, `maintenance_records`, `delivery_events`, `safety_incidents`, `driver_monthly_metrics`, and `truck_utilization_metrics`. Their primary keys and foreign-key relationships are defined in the Prisma schema. Prisma model names retain the `Kaggle` prefix to distinguish this historical/imported dataset from FleetFlow's operational entities.

The admin overview now queries these tables from Neon directly. It shows recorded load count and revenue, trip mileage, active driver/truck counts, delivery punctuality, fuel efficiency, safety incident totals, and recent loads joined to their customers and routes. The Kaggle import still does **not** create FleetFlow `Shipment` records or Authentik identities. Its facilities are the operational location source for newly created shipments, while drivers and customers are synchronized separately from the Authentik database.

The table rename migration uses PostgreSQL `ALTER TABLE ... RENAME` and renames the existing indexes and constraints; it does not recreate or discard the imported rows.

Download and import the dataset:

```python
import kagglehub

path = kagglehub.dataset_download("yogape/logistics-operations-database")
print("Path to dataset files:", path)
```

Apply migrations and import the extracted directory:

```powershell
npm run db:deploy
npm run db:import:kaggle -- --source "C:\path\to\logistics-operations-database"
npm run db:verify:kaggle
```

Alternatively, set `KAGGLE_DATASET_DIR` to the extracted dataset directory and omit `--source`. The importer streams the CSV files, loads parent records before dependent records, stores nullable source foreign keys as nullable relations, and skips existing keys so the same dataset version can be imported again safely.

`db:verify:kaggle` checks expected row counts, confirms the relational constraints, and reads a related load/customer/route/trip/delivery-event record. Update its expected counts when intentionally importing a different dataset version.

## Static and external home-page content

The home page is a landing page, not an operational data view. Its promotional percentages and branch cards are static content from [`../src/app/page.tsx`](../src/app/page.tsx) and [`../src/lib/branches.ts`](../src/lib/branches.ts). When Superset environment variables are configured, its embedded network map is fetched from Superset; otherwise the map falls back to a static illustration. Do not interpret the landing-page figures as live database metrics.

## Adding a new data-backed view

1. Define or reuse a typed Prisma model and an explicit relation in the schema.
2. Create and apply a migration with the existing migration workflow.
3. Add a narrow query to `src/lib/data.ts`; select only the fields needed by the view.
4. Read it in a server component or route handler. Mark pages that must query current data with `dynamic = "force-dynamic"`.
5. Apply session and ownership checks on private reads and writes. Record mutations and their audit events in the same Prisma transaction.
6. Document whether the view uses FleetFlow operational records, imported logistics analytics records, or external/static content.
