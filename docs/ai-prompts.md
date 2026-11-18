# AI agent prompt arsenal

Use these prompts one slice at a time. Ask the agent to inspect the existing code before writing, preserve current conventions, and include tests for domain logic.

## Server actions and audit logging

> Implement typed Next.js server actions for creating a shipment, assigning a driver, and updating shipment status. Validate inputs, enforce the caller's role and ownership, and use one Prisma transaction for each status update so the `Shipment` update and matching `StatusLog` insert commit atomically. Add unit tests for valid transitions, invalid transitions, and unauthorized callers.

## Admin dashboard

> Build a responsive Admin Dashboard using Tailwind CSS and shadcn/ui. Include shipment metrics, a paginated shipment table, status badges with accessible labels, driver assignment, and a create-shipment dialog. Use server components for data loading and client components only for interaction. Include loading, empty, validation, and error states.

## Driver workflow

> Build a mobile-first driver shipment view. Show only shipments assigned to the current driver, provide clear next-status actions, and collect an optional location and proof-of-delivery note. Disable invalid transitions, show optimistic progress carefully, and refresh from the server after mutation.

## Customer workspace

> Build an authenticated customer workspace that lists only shipments whose customer email matches the signed-in Auth.js user. Render customer-safe status timelines without internal notes, driver identities, or delivery-proof data. Add clear empty, not-found, and error states.

## Auth.js middleware

> Write Next.js App Router middleware for Auth.js v5. Redirect signed-in users to `/admin`, `/driver`, or `/customer` from `/workspace`, protect each workspace for its matching role, and preserve the ownership checks in the page and API queries. Add tests or a small authorization matrix for the route rules.
