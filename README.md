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
src/lib/                      Typed demo data and domain types
.env.example                  Required environment variables
CONTRIBUTING.md               Development and delivery conventions
```

## Local implementation starting point

```bash
npx create-next-app@latest fleetflow --typescript --tailwind --app
cd fleetflow
npm install @prisma/client next-auth @auth/prisma-adapter bcrypt
npm install -D prisma
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
```

The current UI runs on typed demo data so the workflows can be reviewed before PostgreSQL and Auth.js are configured. Follow [`docs/roadmap.md`](docs/roadmap.md) to replace the demo store with Prisma reads, authentication, and transactional server actions.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — roles, boundaries, and key flows
- [`docs/roadmap.md`](docs/roadmap.md) — phased implementation plan and acceptance criteria
- [`docs/ai-prompts.md`](docs/ai-prompts.md) — prompts for building the major slices with coding agents
- [`docs/blueprint.md`](docs/blueprint.md) — source blueprint captured from the original project plan
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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend endpoints are available at `/api/health`, `/api/shipments`, and `/api/shipments/:trackingCode`. The current API uses an in-memory demo store; PostgreSQL persistence is the next backend milestone.

## Security notes

Never commit `.env`, database credentials, session secrets, or uploaded proof-of-delivery files. Passwords must be stored as slow hashes, and every status transition must be authorized and recorded in `StatusLog`.
