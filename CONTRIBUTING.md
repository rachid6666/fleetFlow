# Contributing to FleetFlow

Keep changes focused on one workflow or domain concern. Update the relevant documentation when behavior or schema changes.

Before opening a pull request:

- run formatting, linting, and type checks;
- run unit and integration tests for changed behavior;
- run `npx prisma validate` when touching the schema;
- confirm no secrets or customer data are included;
- describe authorization and audit-log implications in the pull request.

Prefer small server actions with explicit input schemas. Never trust a role supplied by the browser, and never update a shipment status without an audit record.
