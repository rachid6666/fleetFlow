# FleetFlow implementation roadmap

## Phase 1 — scaffold and persistence

**Current state:** the Next.js App Router scaffold, Prisma schema, Neon persistence, operational shipment workflows, live tracking, payment ledger, and role workspaces are implemented.

- Create the Next.js TypeScript app with App Router and Tailwind.
- Install Prisma and Auth.js dependencies.
- Add the schema in `prisma/schema.prisma`.
- Configure PostgreSQL and run the initial migration.
- Add a Prisma client singleton, facility data, Authentik identity synchronization, and the optional synthetic tracking seed.

**Done when:** a fresh checkout can migrate and seed a local database.

## Phase 2 — authentication and RBAC

- Configure Auth.js credentials or an approved identity provider.
- Hash passwords with bcrypt or an equivalent slow password hash.
- Include `role` in the JWT/session callback.
- Protect `/admin/*`, `/sales/*`, `/driver/*`, `/customer/*`, and authenticated dashboard routes in middleware.
- Repeat authorization in every mutation; middleware alone is not sufficient.

**Done when:** unauthorized users are redirected and direct action calls are rejected server-side.

## Phase 3 — operational workflows

- Admin shipment table, creation form, assignment, reassignment, filters, metrics, live tracking, and payment ledger.
- Sales dashboard with customer shipment creation, live operations, alerts, and read-only receivables.
- Driver mobile view with assigned shipments and one-tap valid status transitions.
- Authenticated customer workspace with own-shipment listing and customer-safe timeline.
- POD note and exception capture with input validation.

**Done when:** each role can complete its core workflow with responsive, accessible UI.

## Phase 4 — auditability and hardening

- Wrap status changes in Prisma transactions.
- Add transition, payment, Sales authorization, and live-map fallback tests.
- Add external payment-processor integration, invoicing, refunds, and write-offs if required by the product.
- Add pagination, search, empty states, loading states, and error handling.
- Add rate limiting for login attempts and role-scoped shipment API requests.
- Add structured logging and operational error reporting.

**Done when:** every status change is explainable from database history and the main failure paths are tested.

## Phase 5 — delivery

- Configure environment variables in Vercel or Railway.
- Run production migrations using the deployment-safe workflow.
- Verify database backups, object storage, secret rotation, and HTTPS.
- Add CI for type checking, linting, tests, and Prisma schema validation.

**Done when:** the production deployment is reproducible and secrets are managed outside Git.
