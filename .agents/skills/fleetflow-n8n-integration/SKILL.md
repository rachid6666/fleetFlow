---
name: fleetflow-n8n-integration
description: Use when creating or changing FleetFlow n8n workflows, payload contracts, credentials, validation, error handling, idempotency, or export files.
---

# FleetFlow n8n integration

1. Read `docs/handover.md`, the relevant API route, Prisma schema, and existing workflow JSON before editing.
2. Keep exported JSON credential-free; use n8n environment variables and local `.env` names documented in `docs/handover.md`.
3. Validate required fields and references at the API boundary, use a stable unique `event_id`, and make repeats safe.
4. Preserve Auth.js role checks, Prisma transactions, and `StatusLog` audit behavior; expose useful HTTP errors and workflow responses.
5. Keep optional team notifications non-blocking when no webhook is configured, and update the authoritative handover contract with every interface change.
