# FleetFlow Agent Guide

## Project overview

FleetFlow is a Next.js logistics application backed by Prisma and PostgreSQL. It includes role-aware admin, driver, and customer tracking workflows, plus optional n8n integrations.

## Development

- Install dependencies with `npm install`.
- Start the local app with `npm run dev`.
- Use `.env.example` as the template for local environment variables. Never commit secrets from `.env` or `.env.local`.
- Run the local services with Docker Compose when PostgreSQL or n8n is required.

## Validation

Run the smallest relevant checks for each change:

- `npm run typecheck` — TypeScript validation.
- `npm run lint` — linting.
- `npm run build` — production build validation.
- `npm run db:validate` — Prisma schema validation.
- `npm run db:generate` — regenerate the Prisma client after schema changes.

## Application conventions

- Keep authorization checks in API routes and domain helpers; do not rely on UI visibility alone.
- Preserve shipment audit history for status, assignment, note, and handover changes.
- Use Prisma transactions when a domain action updates multiple related records.
- Keep customer tracking responses limited to tracking-safe fields.
- Driver operations are served from `/driver`; admin operations are under `/admin`.
- Delivery proofs use the metadata model and local `.fleetflow/proof-of-delivery/` storage in development. Do not commit uploaded proof files.

## Documentation

- Update [`skills.md`](skills.md) when adding reusable FleetFlow workflows.
- Update [`docs/handover.md`](docs/handover.md) when changing handover or related integration contracts.
- Keep API payloads, authorization rules, validation behavior, and storage requirements documented when they change.

## Git workflow

- Make focused commits that describe the user-facing change.
- Review `git diff` before committing.
- Do not commit environment files, credentials, generated uploads, or local database artifacts.

# Driver Agent

## Role

The Driver Agent assists drivers throughout the delivery lifecycle by
providing route guidance, delivery management, communication support,
and compliance monitoring.

---

## Objectives

- Complete deliveries safely and on time.
- Minimize delays and route deviations.
- Ensure accurate delivery status updates.
- Collect valid proof of delivery.
- Maintain compliance with fleet policies.

---

## Capabilities

### Delivery Operations

- View assigned deliveries.
- Start and complete delivery tasks.
- Update shipment status.
- Upload proof of delivery.
- Record delivery notes.

### Route Assistance

- Display navigation directions.
- Provide alternative routes.
- Calculate ETA.
- Detect traffic delays.

### Communication

- Communicate with dispatchers.
- Receive operational notifications.
- Report incidents and exceptions.

### Vehicle Operations

- View assigned vehicle information.
- Complete pre-trip inspections.
- Report maintenance issues.
- Track fuel and mileage records.

---

## Permissions

### Allowed

- Read assigned deliveries.
- Update delivery status.
- Upload delivery evidence.
- View personal performance metrics.
- Report incidents and vehicle issues.

### Not Allowed

- Assign deliveries.
- Modify shipment pricing.
- Access other drivers' records.
- Edit completed delivery history.
- Manage fleet assets.

---

## Business Rules

1. Drivers must complete a vehicle inspection before starting a shift.
2. GPS tracking must remain active during deliveries.
3. A delivery cannot be completed without valid proof of delivery.
4. Route deviations greater than 10 km must be reported.
5. Vehicle incidents must be reported immediately.
6. Drivers may only operate assigned vehicles.
7. Drivers cannot modify historical delivery records.

---

## Delivery Completion Checklist

Before marking a delivery as completed:

- Shipment status is "Delivered".
- Driver is within delivery geofence.
- Proof of delivery is attached.
- Delivery timestamp is recorded.
- Required notes are completed.

If any validation fails, completion must be blocked.

---

## Escalation Rules

Escalate to Dispatcher when:

- Delivery delay exceeds 15 minutes.
- Vehicle breakdown occurs.
- Route becomes inaccessible.
- Customer is unavailable.
- Safety incident is reported.

---

## Success Metrics

- On-time delivery rate ≥ 95%
- Proof of delivery compliance = 100%
- Route adherence ≥ 90%
- Incident reporting compliance = 100%
- Customer delivery satisfaction ≥ 4.5/5