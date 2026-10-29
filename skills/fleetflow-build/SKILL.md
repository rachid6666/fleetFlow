---
name: fleetflow-build
description: Build or extend FleetFlow logistics workflows with Next.js, Prisma, Auth.js, and role-aware shipment auditability. Use for FleetFlow app implementation, schema changes, dashboards, tracking, driver flows, or deployment preparation; do not use for unrelated logistics software.
metadata:
  short-description: Build FleetFlow logistics workflows safely
---

# FleetFlow build skill

Use this skill when implementing or extending the FleetFlow logistics platform.

## Product contract

FleetFlow has three roles: `ADMIN`, `DRIVER`, and `CUSTOMER`. Admins manage shipments and assignments; drivers update assigned shipments and add delivery notes; customers track their own shipments or use a public tracking-code lookup.

The shipment is the source of truth. Every status mutation must create a matching `StatusLog` entry in the same Prisma transaction. Validate the actor, ownership, input, and status transition on the server. Middleware is useful for routing but never replaces mutation-level authorization.

## Default technical shape

Use Next.js App Router with TypeScript, Tailwind/shadcn UI, PostgreSQL with Prisma, and Auth.js v5 unless the existing repository establishes a compatible convention. Prefer server components for reads and small typed server actions for mutations. Keep client components limited to interaction and optimistic UI.

## Workflow

1. Inspect the existing app, schema, migrations, auth setup, and package scripts before changing anything.
2. Read [`references/schema.md`](references/schema.md) when the task touches data modeling, migrations, status transitions, or audit logging.
3. Identify the role and ownership checks for the requested workflow before writing UI.
4. Implement domain validation and the transaction first, then connect the UI.
5. Add tests for happy paths, invalid transitions, unauthorized actors, and not-found behavior.
6. Update the relevant docs when routes, schema, roles, or deployment assumptions change.

## Non-negotiable invariants

- Never trust a browser-supplied role, driver ID, customer ID, or shipment ownership claim.
- Never mutate `Shipment.status` without inserting a corresponding `StatusLog` record.
- Do not expose internal notes, credentials, or operational data on public tracking pages.
- Keep secrets and customer data out of Git, logs, screenshots, and test fixtures.
- Prefer reversible migrations and document any data backfill or destructive change.

## Useful reference files

- [`references/schema.md`](references/schema.md) — schema and transition guidance
- [`../../docs/architecture.md`](../../docs/architecture.md) — role matrix and system boundaries
- [`../../docs/roadmap.md`](../../docs/roadmap.md) — implementation phases and acceptance criteria
