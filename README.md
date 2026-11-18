# FleetFlow

FleetFlow is a multi-role logistics operations platform for shipment tracking, driver assignment, delivery updates, proof-of-delivery notes, and auditable exception handling.

This repository now includes the first runnable product slice plus the implementation-ready blueprint and reusable starter for building FleetFlow with a TypeScript monorepo approach.

## Product scope

- **Admin:** manage users and shipments, assign drivers, reassign work, and monitor operational metrics.
- **Driver:** use a mobile-first workflow to update status, add proof-of-delivery notes, and record exceptions.
- **Customer / shipper:** view only their own shipments and customer-safe event timelines.

## Recommended stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma ORM, Auth.js v5, and Vercel or Railway.

## Repository map

```text
docs/                         Product, architecture, roadmap, and AI prompts
prisma/schema.prisma          Initial relational data model
skills/fleetflow-build/       Reusable Codex skill for future FleetFlow work
src/app/                      Admin, driver, and customer workspace screens
src/lib/                      Prisma data access and domain types
.env.example                  Required environment variables
CONTRIBUTING.md               Development and delivery conventions
```

## Current data model

The application reads shipments from PostgreSQL through Prisma. Sign-in routes users to their role workspace from Authentik group claims. Shipment status changes are authenticated and persist an audit event in the same transaction. Customer responses omit internal notes, driver identities, and delivery-proof data.
Live tracking stores append-only `ShipmentLocationPing` records and derives route progress and ETA from shipment coordinates. Seven synthetic GPS routes are available through `npm run db:seed:tracking`.

The Kaggle trucking dataset is stored separately in 14 typed `Kaggle*` tables. This preserves its source entities and relationships without creating synthetic Auth.js accounts or converting historical loads into mutable FleetFlow shipments.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — roles, boundaries, and key flows
- [`docs/access-concept.md`](docs/access-concept.md) — server-side access rules and allowed/forbidden endpoint tests
- [`docs/roadmap.md`](docs/roadmap.md) — phased implementation plan and acceptance criteria
- [`docs/ai-prompts.md`](docs/ai-prompts.md) — prompts for building the major slices with coding agents
- [`docs/blueprint.md`](docs/blueprint.md) — source blueprint captured from the original project plan
- [`docs/data-and-database.md`](docs/data-and-database.md) — what reads from Neon, Kaggle table relationships, and database setup/import
- [`docs/live-tracking-and-copilot.md`](docs/live-tracking-and-copilot.md) — synthetic GPS routes, telemetry API, and admin AI copilot
- [`skills/fleetflow-build/SKILL.md`](skills/fleetflow-build/SKILL.md) — reusable Codex skill

## Product screens

- `/admin` — operational metrics, live GPS map, recent shipments, and exception/stale-feed alerts
- `/admin/copilot` — admin-only AI operations copilot grounded in live and historical logistics data
- `/admin/shipments` — shipment desk with routes, statuses, drivers, customers, and ETAs
- `/driver` — mobile-oriented assigned shipment workflow with status actions
- `/customer` ? authenticated customer workspace containing only the signed-in customer?s shipments
- `/workspace` ? role-aware post-login redirect for admin, driver, and customer users

Authentication is prepared for Authentik OIDC through Auth.js. See [`docs/authentik.md`](docs/authentik.md) for provider setup and callback URLs.

Apache Superset map embedding is also prepared. Follow [`docs/superset.md`](docs/superset.md) to run Superset locally and connect a dashboard.
The admin analytics page at `/admin/analytics` embeds a provisioned 21-chart Superset dashboard using the existing database. See [analytics setup](docs/analytics.md); run `npm run superset:setup` then `npm run superset:up`.

## Start locally with Docker Compose

FleetFlow keeps persistent data in Neon. Docker runs the FleetFlow app, n8n, Superset, and Authentik, but it does **not** start a local PostgreSQL container.

1. Create the application database and copy both Neon connection strings into the root `.env`:

   ```powershell
   Copy-Item .env.example .env
   ```

   `DATABASE_URL` must use Neon's pooled `-pooler` hostname. `DATABASE_URL_UNPOOLED` must use the direct hostname without `-pooler`; Prisma migrations use this direct connection.

2. Start the FleetFlow application and n8n:

   ```powershell
   docker compose up --build
   ```

Authentik uses a separate Neon database and its own ignored environment file:

```powershell
Copy-Item authentik/.env.example authentik/.env
docker compose -f authentik/compose.yml up -d
```

Fill in the pooled `PG_HOST`, direct `PG_DIRECT_HOST`, credentials, database name, and Authentik secret before starting it. See [`docs/authentik.md`](docs/authentik.md) for setup and the migration workflow.

The app waits for n8n, applies checked-in Prisma migrations through the direct Neon URL, and runs the repeatable seed before starting. Open `http://localhost:3000`, n8n at `http://localhost:5678`, and health at `http://localhost:3000/api/health`. The seeded tracking code is `FF-LOCAL-001`. The only named app volume is `fleetflow-n8n`; application data lives in Neon.

Host-side Prisma commands use the same root `.env` values:

```powershell
npm run db:validate
npm run db:deploy
npm run db:seed
```

## n8n workflows

Import both files in n8n from `Workflows` → `Import from File`:

- `workflows/fleetflow-handover.json` receives the server-side handover event and calls the protected FleetFlow integration endpoint.
- `workflows/fleetflow-team-activity.json` handles explicit `START_TASK` events plus GitHub push and pull-request events.

Configure `FLEETFLOW_API_URL`, `N8N_WEBHOOK_SECRET`, and optional `TEAM_NOTIFICATION_WEBHOOK_URL` in the local n8n environment. The handover workflow uses `http://app:3000` inside Compose; do not change it to `localhost`. Create any provider-specific notification credential in your own n8n instance and keep it out of exports. See [`docs/handover.md`](docs/handover.md) for payloads, validation, idempotency, role access, and error responses.

GitHub cannot see uncommitted local work, so use an explicit `START_TASK` webhook action when work begins. A GitHub organization webhook needs a reachable shared n8n URL; a teammate's local n8n is not a team-wide callback target.

Troubleshooting:

- `app` is unhealthy: inspect `docker compose logs app`, confirm the root `.env` contains both Neon URLs, then retry `docker compose up --build`.
- `P1001` or migration errors: verify Neon network access, SSL mode, the pooled hostname in `DATABASE_URL`, and the direct hostname in `DATABASE_URL_UNPOOLED`.
- n8n callbacks fail: verify both services use the same `N8N_WEBHOOK_SECRET`, use Compose service names internally, and import/activate the workflow.
- A team notification is skipped: this is expected when `TEAM_NOTIFICATION_WEBHOOK_URL` is blank; local FleetFlow remains usable.

To load the MIT-licensed [Kaggle Logistics Operations Database](https://www.kaggle.com/datasets/yogape/logistics-operations-database), download it with `kagglehub.dataset_download("yogape/logistics-operations-database")`, then run:

```powershell
npm run db:import:kaggle -- --source "C:\path\to\logistics-operations-database"
```

The importer maps all 14 CSV files into typed relational tables (`customers`, `drivers`, `loads`, `trips`, `delivery_events`, and related tables), with primary keys and foreign-key relations matching the dataset schema. It imports parent tables before dependent records, preserves optional foreign keys as nullable relations, and skips existing keys when re-run. The admin overview fetches logistics metrics and recent joined loads directly from Neon. Use `npm run db:verify:kaggle` to check imported row totals and relational constraints.

Open [http://localhost:3000](http://localhost:3000). `/api/health` checks the database connection. `/api/shipments` requires a session and returns all shipments for admins, assigned shipments for drivers, and customer-safe shipments for customers. `/api/shipments/:trackingCode` requires a session and enforces role ownership.

The admin overview flags shipments marked `EXCEPTION` and shipments still `IN_TRANSIT` with no update for at least 24 hours. The stale-update threshold is a monitoring signal, not an ETA-based late-delivery prediction; live shipments do not currently store an ETA.

## Security notes

Never commit `.env`, database credentials, session secrets, or uploaded proof-of-delivery files. Passwords must be stored as slow hashes, and every status transition must be authorized and recorded in `StatusLog`.

## Operations runbook

### Services and ports

- **FleetFlow web/API:** `3000` by default. Next.js serves the UI and `/api/*` routes from the same process.
- **PostgreSQL:** Neon-managed; no local database container. FleetFlow uses `fleet`; Authentik uses the separate `authentik` database.
- **n8n:** `5678`, with persistent named volume `fleetflow-n8n`.
- **Authentik:** server and worker use the separate Neon `authentik` database; use the issuer configured by `AUTHENTIK_ISSUER`.
- **Apache Superset:** `8088` only when the embedded analytics map is enabled.

### Start commands

```powershell
Copy-Item .env.example .env
docker compose up --build
docker compose -f authentik/compose.yml up -d
```

Optional host-side Prisma commands (when `DATABASE_URL` points to a host-resolvable database):

```powershell
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

Verification:

```powershell
curl.exe -i "http://localhost:3000/api/health"
curl.exe -i "http://localhost:3000/api/shipments/FF-2048-AL"
```

For the access-control test matrix, see [`docs/access-concept.md`](docs/access-concept.md). Stop the local process with `Ctrl+C` when finished.
