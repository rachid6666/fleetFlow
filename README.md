# FleetFlow

FleetFlow is a multi-role logistics operations platform for shipment tracking, driver assignment, delivery updates, proof-of-delivery notes, and auditable exception handling.

This repository now includes the first runnable product slice plus the implementation-ready blueprint and reusable starter for building FleetFlow with a TypeScript monorepo approach.

## Product scope

- **CEO/Admin:** manage users and shipments, assign drivers, record payments, and monitor sales and operational metrics.
- **Sales:** create customer shipments and view sales, receivables, live tracking, and operational exceptions without assigning drivers or recording payments.
- **Driver:** use a mobile-first workflow to update status, add proof-of-delivery notes, and record exceptions.
- **Customer / shipper:** view only their own shipments and customer-safe event timelines.

## Recommended stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma ORM, Auth.js v5, and Vercel or Railway.

## Repository map

```text
docs/                         Product, architecture, roadmap, and AI prompts
prisma/schema.prisma          Initial relational data model
skills/fleetflow-build/       Reusable Codex skill for future FleetFlow work
src/app/                      Admin, sales, driver, and customer workspace screens
src/lib/                      Prisma data access and domain types
.env.example                  Required environment variables
CONTRIBUTING.md               Development and delivery conventions
```

## Current data model

The application reads shipments from PostgreSQL through Prisma. Auth.js maps Authentik groups to admin, sales, driver, and customer roles. Shipment status changes are authenticated and persist an audit event in the same transaction. Customer responses omit internal notes, driver identities, and delivery-proof data.
Live tracking stores append-only `ShipmentLocationPing` records and derives route progress and ETA from shipment coordinates. New shipments receive an initial origin ping. Facility-based shipments created before telemetry existed are still displayed at their origin, or at the destination when delivered. Shipment locations come from the U.S. `facilities` table in Neon, and active drivers/customers are synchronized from the separate Authentik database.
The payment ledger stores an optional shipment charge and append-only `ShipmentPayment` records. Admins can record cash, bank transfer, card, or other externally received payments. Sales can view receivables but cannot mutate the ledger. `npm run db:seed:tracking` optionally refreshes seven clearly marked synthetic live routes for demonstrations.

The Kaggle trucking dataset is stored separately in 14 typed `Kaggle*` tables. This preserves its source entities and relationships without creating synthetic Auth.js accounts or converting historical loads into mutable FleetFlow shipments.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — roles, boundaries, and key flows
- [`docs/api-report.md`](docs/api-report.md) — API inventory, authentication, authorization, payloads, and integrations
- [`docs/business-logic.md`](docs/business-logic.md) — implemented business rules, known gaps, proposed rules, and acceptance scenarios
- [`docs/access-concept.md`](docs/access-concept.md) — server-side access rules and allowed/forbidden endpoint tests
- [`docs/roadmap.md`](docs/roadmap.md) — phased implementation plan and acceptance criteria
- [`docs/ai-prompts.md`](docs/ai-prompts.md) — prompts for building the major slices with coding agents
- [`docs/blueprint.md`](docs/blueprint.md) — source blueprint captured from the original project plan
- [`docs/data-and-database.md`](docs/data-and-database.md) — what reads from Neon, Kaggle table relationships, and database setup/import
- [`docs/live-tracking-and-copilot.md`](docs/live-tracking-and-copilot.md) — stored GPS telemetry, telemetry API, and admin AI copilot
- [`skills/fleetflow-build/SKILL.md`](skills/fleetflow-build/SKILL.md) — reusable Codex skill

## Product screens

- `/admin` - operational metrics, live GPS map, recent shipments, and exception/stale-feed alerts
- `/admin/copilot` - admin-only AI operations copilot grounded in live and historical logistics data
- `/admin/shipments` - shipment desk with routes, statuses, drivers, customers, charges, and ETAs
- `/admin/payments` - admin payment ledger with charges, collected totals, balances, and payment recording
- `/sales` - sales and operations dashboard with customer shipment creation, live tracking, alerts, and read-only receivables
- `/driver` - mobile-oriented assigned shipment workflow with status actions
- `/customer` - authenticated customer workspace containing only the signed-in customer's shipments
- `/workspace` - role-aware post-login redirect for admin, sales, driver, and customer users

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

The app waits for n8n, applies checked-in Prisma migrations through the direct Neon URL, and syncs active Authentik driver/customer identities before starting. Open `http://localhost:3000`, n8n at `http://localhost:5678`, and health at `http://localhost:3000/api/health`. The only named app volume is `fleetflow-n8n`; application data lives in Neon.

Host-side Prisma commands use the same root `.env` values:

```powershell
npm run db:validate
npm run db:deploy
npm run db:seed
npm run db:seed:tracking
```

`db:seed` synchronizes Authentik driver/customer projections and verifies facilities. `db:seed:tracking` is optional and adds or refreshes the seven synthetic `FF-LIVE-*` demonstration routes.

## n8n workflows

Import both files in n8n from `Workflows` → `Import from File`:

- `workflows/fleetflow-handover.json` receives the server-side handover event and calls the protected FleetFlow integration endpoint.
- `workflows/fleetflow-team-activity.json` handles explicit `START_TASK` events plus GitHub push and pull-request events.

Set `N8N_WEBHOOK_SECRET` to the same value in the FleetFlow environment and n8n container. Use `FLEETFLOW_API_URL=http://app:3000` when FleetFlow and n8n both run in Compose. For host-run `npm run dev`, use `FLEETFLOW_API_URL=http://host.docker.internal:3000`. The host app should call n8n at `http://localhost:5678`, while a Compose-hosted app uses `http://n8n:5678`. `TEAM_NOTIFICATION_WEBHOOK_URL` is optional and returns `notified:false` when blank. See [`docs/handover.md`](docs/handover.md) for activation, payloads, validation, idempotency, role access, and error responses.

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

Open [http://localhost:3000](http://localhost:3000). `/api/health` checks the database connection. `/api/shipments` requires a session and returns all shipments to admins and sales users, assigned shipments to drivers, and customer-safe shipments to customers. Admins and sales users can create customer shipments. Sales users cannot assign drivers. `/api/payments` requires an admin session. `/api/tracking/live` is available to admins and sales users.

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
