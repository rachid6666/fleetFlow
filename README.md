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
- [`docs/roadmap.md`](docs/roadmap.md) — phased implementation plan and acceptance criteria
- [`docs/ai-prompts.md`](docs/ai-prompts.md) — prompts for building the major slices with coding agents
- [`docs/blueprint.md`](docs/blueprint.md) — source blueprint captured from the original project plan
- [`docs/data-and-database.md`](docs/data-and-database.md) — what reads from Neon, Kaggle table relationships, and database setup/import
- [`skills/fleetflow-build/SKILL.md`](skills/fleetflow-build/SKILL.md) — reusable Codex skill

## Product screens

- `/admin` — operational metrics, recent shipments, and live activity
- `/admin/shipments` — shipment desk with routes, statuses, drivers, customers, and ETAs
- `/driver` — mobile-oriented assigned shipment workflow with status actions
- `/track` — customer tracking code lookup and event timeline

Authentication is prepared for Authentik OIDC through Auth.js. See [`docs/authentik.md`](docs/authentik.md) for provider setup and callback URLs.

Apache Superset map embedding is also prepared. Follow [`docs/superset.md`](docs/superset.md) to run Superset locally and connect a dashboard.

## Start locally

From the project folder:

```bash
npm install
Copy-Item .env.example .env.local
npm run db:deploy
npm run db:seed
npm run dev
```

Set `DATABASE_URL` to Neon's pooled connection string for app queries and `DATABASE_URL_UNPOOLED` to its direct connection string for migrations. Neon CLI deployments populate both variables in `.env`. Run `npm run db:deploy` to apply checked-in Prisma migrations and `npm run db:seed` to provision the reference branches.

To load the MIT-licensed [Kaggle Logistics Operations Database](https://www.kaggle.com/datasets/yogape/logistics-operations-database), download it with `kagglehub.dataset_download("yogape/logistics-operations-database")`, then run:

```powershell
npm run db:import:kaggle -- --source "C:\path\to\logistics-operations-database"
```

The importer maps all 14 CSV files into typed relational tables (`customers`, `drivers`, `loads`, `trips`, `delivery_events`, and related tables), with primary keys and foreign-key relations matching the dataset schema. It imports parent tables before dependent records, preserves optional foreign keys as nullable relations, and skips existing keys when re-run. The admin overview fetches logistics metrics and recent joined loads directly from Neon. Use `npm run db:verify:kaggle` to check imported row totals and relational constraints.

Open [http://localhost:3000](http://localhost:3000). `/api/health` checks the database connection, `/api/shipments` requires an admin or driver session, and `/api/shipments/:trackingCode` provides public tracking fields while requiring an admin or assigned-driver session for status changes.

## Security notes

Never commit `.env`, database credentials, session secrets, or uploaded proof-of-delivery files. Passwords must be stored as slow hashes, and every status transition must be authorized and recorded in `StatusLog`.
