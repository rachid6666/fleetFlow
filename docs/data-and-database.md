# Database and UI data flow

## Database connections

The app uses Prisma with the existing PostgreSQL schema in [`../prisma/schema.prisma`](../prisma/schema.prisma).

- `DATABASE_URL` is Neon's pooled connection and is used by application queries.
- `DATABASE_URL_UNPOOLED` is Neon's direct connection and is used by Prisma migrations.
- `npm run db:deploy` applies checked-in migrations.
- `npm run db:validate` validates the Prisma schema.
- `npm run db:generate` regenerates the Prisma client.

Do not commit `.env` or paste database connection strings into source files. Keep the local values supplied by the Neon CLI.

## What the UI reads

Operational pages use server-side Prisma queries from [`../src/lib/data.ts`](../src/lib/data.ts). The admin dashboard, shipment desk, and tracking page are dynamically rendered so they read current database state rather than a build-time snapshot.

| Page or endpoint | Data source | Access and behavior |
|---|---|---|
| `/admin` | `loads`, `trips`, `drivers`, `trucks`, `delivery_events`, `safety_incidents` | Admin-only; live load revenue, distance, active fleet, delivery performance, and recent loads |
| `/admin/shipments` | `Shipment`, related `User` records | Admin-only; live shipment, driver, and customer data |
| `/driver` | `Shipment`, related driver `User` | Driver-only; shipments assigned to the signed-in account's email |
| `/track?code=...` | `Shipment`, `StatusLog` | Public tracking lookup; returns only tracking-safe fields |
| `GET /api/health` | PostgreSQL `SELECT 1` | Reports `503` if the database cannot be reached |
| `GET /api/shipments` | `Shipment`, related `User` records | Requires an admin or driver session; drivers see only their own assignments |
| `GET /api/shipments/:trackingCode` | `Shipment`, `StatusLog` | Public tracking lookup; does not return customer, driver, or internal notes |
| `PATCH /api/shipments/:trackingCode` | `Shipment`, `StatusLog` | Requires an admin or assigned driver; status update and audit event are one transaction |

FleetFlow's separate operational records are stored in the `User`, `Branch`, `Shipment`, and `StatusLog` tables. `/admin/shipments`, `/driver`, and customer tracking continue to read those tables. The seed script provisions reference branches; it does not create shipment demo records. Shipment lists remain empty until FleetFlow shipments are created.

## Kaggle logistics dataset

The [MIT-licensed Logistics Operations Database](https://www.kaggle.com/datasets/yogape/logistics-operations-database) is loaded into 14 typed relational tables with plain names: `customers`, `drivers`, `trucks`, `trailers`, `facilities`, `routes`, `loads`, `trips`, `fuel_purchases`, `maintenance_records`, `delivery_events`, `safety_incidents`, `driver_monthly_metrics`, and `truck_utilization_metrics`. Their primary keys and foreign-key relationships are defined in the Prisma schema. Prisma model names retain the `Kaggle` prefix to distinguish this historical/imported dataset from FleetFlow's operational entities.

The admin overview now queries these tables from Neon directly. It shows recorded load count and revenue, trip mileage, active driver/truck counts, delivery punctuality, fuel efficiency, safety incident totals, and recent loads joined to their customers and routes. The Kaggle import still does **not** create `User` accounts or FleetFlow `Shipment` records. Source driver records have no Authentik identity, and historical trucking `loads` are not the same domain record as a FleetFlow shipment.

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
