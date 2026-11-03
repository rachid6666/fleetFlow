# FleetFlow

FleetFlow is a multi-role logistics operations platform for shipment tracking, driver assignment, delivery updates, proof-of-delivery notes, and auditable exception handling.

This repository now includes the first runnable product slice plus the implementation-ready blueprint and reusable starter for building FleetFlow with a TypeScript monorepo approach.

## Product scope

- **Admin:** manage users and shipments, assign drivers, reassign work, and monitor operational metrics.
- **Driver:** use a mobile-first workflow to update status, add proof-of-delivery notes, and record exceptions.
- **Customer / shipper:** look up a shipment by tracking code and view its event timeline.

## Recommended stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma ORM, Auth.js v5, and Vercel or Railway.

## Repository map

```text
docs/                         Product, architecture, roadmap, and AI prompts
prisma/schema.prisma          Initial relational data model
skills/fleetflow-build/       Reusable Codex skill for future FleetFlow work
src/app/                      Admin, driver, and customer tracking screens
src/lib/                      Prisma data access and domain types
.env.example                  Required environment variables
CONTRIBUTING.md               Development and delivery conventions
```

## Current data model

The application reads shipments from PostgreSQL through Prisma. Shipment status changes are authenticated and persist an audit event in the same transaction. Public tracking responses omit customer, driver, and internal-note fields.

The Kaggle trucking dataset is stored separately in 14 typed `Kaggle*` tables. This preserves its source entities and relationships without creating synthetic Auth.js accounts or converting historical loads into mutable FleetFlow shipments.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — roles, boundaries, and key flows
- [`docs/access-concept.md`](docs/access-concept.md) — server-side access rules and allowed/forbidden endpoint tests
- [`docs/roadmap.md`](docs/roadmap.md) — phased implementation plan and acceptance criteria
- [`docs/ai-prompts.md`](docs/ai-prompts.md) — prompts for building the major slices with coding agents
- [`docs/blueprint.md`](docs/blueprint.md) — source blueprint captured from the original project plan
- [`docs/data-and-database.md`](docs/data-and-database.md) — what reads from Neon, Kaggle table relationships, and database setup/import
- [`skills/fleetflow-build/SKILL.md`](skills/fleetflow-build/SKILL.md) — reusable Codex skill

## Product screens

- `/admin` — operational metrics, recent shipments, and alerts for exceptions or shipments without an update for 24 hours
- `/admin/shipments` — shipment desk with routes, statuses, drivers, customers, and ETAs
- `/driver` — mobile-oriented assigned shipment workflow with status actions
- `/track` — customer tracking code lookup and event timeline

Authentication is prepared for Authentik OIDC through Auth.js. See [`docs/authentik.md`](docs/authentik.md) for provider setup and callback URLs.

Apache Superset map embedding is also prepared. Follow [`docs/superset.md`](docs/superset.md) to run Superset locally and connect a dashboard.

## Start locally with Docker Compose

This is the reproducible fresh-clone path. It starts Next.js, PostgreSQL, and n8n with local-only example values; it does not use Vercel or a hosted database.

```powershell
Copy-Item .env.example .env
docker compose up --build
```

The app container waits for PostgreSQL and n8n health checks, applies checked-in Prisma migrations, and runs the repeatable seed before starting. Open `http://localhost:3000`, n8n at `http://localhost:5678`, and health at `http://localhost:3000/api/health`. The seeded tracking code is `FF-LOCAL-001`. Stop with `Ctrl+C`; do not use `docker compose down -v`, because the PostgreSQL and n8n named volumes are intentionally persistent.

For a host-only development loop, keep the Compose PostgreSQL running and use the repository's npm scripts with a host-resolvable `DATABASE_URL`; production Vercel/Neon settings belong in a separate deployment environment, not in `.env.example`.

## n8n workflows

Import both files in n8n from `Workflows` → `Import from File`:

- `workflows/fleetflow-handover.json` receives the server-side handover event and calls the protected FleetFlow integration endpoint.
- `workflows/fleetflow-team-activity.json` handles explicit `START_TASK` events plus GitHub push and pull-request events.

Configure `FLEETFLOW_API_URL`, `N8N_WEBHOOK_SECRET`, and optional `TEAM_NOTIFICATION_WEBHOOK_URL` in the local n8n environment. The handover workflow uses `http://app:3000` inside Compose; do not change it to `localhost`. Create any provider-specific notification credential in your own n8n instance and keep it out of exports. See [`docs/handover.md`](docs/handover.md) for payloads, validation, idempotency, role access, and error responses.

GitHub cannot see uncommitted local work, so use an explicit `START_TASK` webhook action when work begins. A GitHub organization webhook needs a reachable shared n8n URL; a teammate's local n8n is not a team-wide callback target.

Troubleshooting:

- `app` is unhealthy: inspect `docker compose logs app postgres`, confirm `.env` exists, then retry `docker compose up --build`.
- `P1001` or migration errors: wait for `postgres` to become healthy; never delete the volume automatically. Check `docker compose ps` and `docker compose logs postgres`.
- n8n callbacks fail: verify both services use the same `N8N_WEBHOOK_SECRET`, use Compose service names internally, and import/activate the workflow.
- A team notification is skipped: this is expected when `TEAM_NOTIFICATION_WEBHOOK_URL` is blank; local FleetFlow remains usable.

The older hosted-database flow remains available for deployment documentation, but it is not required for a fresh local clone.

To load the MIT-licensed [Kaggle Logistics Operations Database](https://www.kaggle.com/datasets/yogape/logistics-operations-database), download it with `kagglehub.dataset_download("yogape/logistics-operations-database")`, then run:

```powershell
npm run db:import:kaggle -- --source "C:\path\to\logistics-operations-database"
```

The importer maps all 14 CSV files into typed relational tables (`customers`, `drivers`, `loads`, `trips`, `delivery_events`, and related tables), with primary keys and foreign-key relations matching the dataset schema. It imports parent tables before dependent records, preserves optional foreign keys as nullable relations, and skips existing keys when re-run. The admin overview fetches logistics metrics and recent joined loads directly from Neon. Use `npm run db:verify:kaggle` to check imported row totals and relational constraints.

Open [http://localhost:3000](http://localhost:3000). `/api/health` checks the database connection, `/api/shipments` requires an admin or driver session, and `/api/shipments/:trackingCode` provides public tracking fields while requiring an admin or assigned-driver session for status changes.

The admin overview flags shipments marked `EXCEPTION` and shipments still `IN_TRANSIT` with no update for at least 24 hours. The stale-update threshold is a monitoring signal, not an ETA-based late-delivery prediction; live shipments do not currently store an ETA.

## Security notes

Never commit `.env`, database credentials, session secrets, or uploaded proof-of-delivery files. Passwords must be stored as slow hashes, and every status transition must be authorized and recorded in `StatusLog`.

## Operations runbook

### Services and ports

- **FleetFlow web/API:** `3000` by default. Next.js serves the UI and `/api/*` routes from the same process.
- **PostgreSQL:** `5432`, with persistent named volume `fleetflow-postgres`.
- **n8n:** `5678`, with persistent named volume `fleetflow-n8n`.
- **Authentik:** external OIDC provider; use the issuer configured by `AUTHENTIK_ISSUER`.
- **Apache Superset:** `8088` only when the embedded analytics map is enabled.

### Start commands

```powershell
Copy-Item .env.example .env
docker compose up --build
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
