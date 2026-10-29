# FleetFlow implementation roadmap

## Phase 1 — scaffold and persistence

**Current state:** the Next.js App Router scaffold and first UI slice are implemented. The screens currently use typed demo data so the product flow is reviewable without credentials or a database.

- Create the Next.js TypeScript app with App Router and Tailwind.
- Install Prisma and Auth.js dependencies.
- Add the schema in `prisma/schema.prisma`.
- Configure PostgreSQL and run the initial migration.
- Add a Prisma client singleton and seed data for one admin, one driver, and one customer.

**Done when:** a fresh checkout can migrate and seed a local database.

## Phase 2 — authentication and RBAC

- Configure Auth.js credentials or an approved identity provider.
- Hash passwords with bcrypt or an equivalent slow password hash.
- Include `role` in the JWT/session callback.
- Protect `/admin/*`, `/driver/*`, and authenticated dashboard routes in middleware.
- Repeat authorization in every mutation; middleware alone is not sufficient.

**Done when:** unauthorized users are redirected and direct action calls are rejected server-side.

## Phase 3 — operational workflows

- Admin shipment table, creation form, assignment, reassignment, filters, and metrics.
- Driver mobile view with assigned shipments and one-tap valid status transitions.
- Customer tracking route with tracking-code lookup and chronological timeline.
- POD note and exception capture with input validation.

**Done when:** each role can complete its core workflow with responsive, accessible UI.

## Phase 4 — auditability and hardening

- Wrap status changes in Prisma transactions.
- Add transition tests and authorization tests.
- Add pagination, search, empty states, loading states, and error handling.
- Add rate limiting for public tracking lookup and login attempts.
- Add structured logging and operational error reporting.

**Done when:** every status change is explainable from database history and the main failure paths are tested.

## Phase 5 — delivery

- Configure environment variables in Vercel or Railway.
- Run production migrations using the deployment-safe workflow.
- Verify database backups, object storage, secret rotation, and HTTPS.
- Add CI for type checking, linting, tests, and Prisma schema validation.

**Done when:** the production deployment is reproducible and secrets are managed outside Git.
