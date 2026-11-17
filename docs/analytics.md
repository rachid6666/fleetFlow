# FleetFlow Superset analytics

Open `/admin/analytics` while signed in as a FleetFlow admin. The dashboard has 21 charts for revenue, routes, customers, fuel efficiency, delivery events, costs, safety, utilization, live shipment alerts and a facility network map. The Overview map uses the 50 geocoded facilities in `facilities`, colored by the FleetFlow teal palette and positioned from `latitude` and `longitude`.

## Run locally

Prerequisites: Docker Desktop and the FleetFlow PostgreSQL database, migrated and populated. For the Compose app, start PostgreSQL first so Superset can reach it on the shared `fleetflow` network.

```powershell
docker compose up -d postgres
npm run superset:setup
npm run superset:up
docker compose up -d --build app
```

Setup uses the local Compose PostgreSQL settings from `.env`. Set `SUPERSET_DATABASE_URL` before setup to use a dedicated read-only account instead. The generated embed credentials are written to ignored `superset/.env` and `.env.local`; Docker loads `.env.local` into the app container. The app calls Superset at `http://superset:8088`, and the browser embeds it from http://localhost:8088. Direct dashboard: http://localhost:8088/superset/dashboard/fleetflow-operations/.

For a host-run Next.js process, start it with `npm run dev` after setup; it uses `http://localhost:8088` for both server requests and browser embeds.

Superset username is `fleetflow-admin`; its generated password is `SUPERSET_ADMIN_PASSWORD` in the ignored `superset/.env`. The separate embed service account only mints guest tokens. FleetFlow requires an ADMIN session to issue one. Credentials stay server-side.

```powershell
docker compose -f superset/compose.yml logs --tail 80
npm run superset:verify
npm run superset:down
```

Stopping preserves the metadata volume. Preserve the secret key in `superset/.env` when restarting, since it encrypts the stored database connection. Bootstrap updates FleetFlow-named assets on each start; do not use these names for manually managed charts. No application tables are created or modified.

## Metrics

- The dashboard is split into focused tabs so each view loads a smaller set of queries. Historical charts use the full imported date range; live shipment KPIs use the latest state.
- Revenue is `SUM(loads.revenue)`, matching the app. Surcharges and accessorial charges are not added implicitly.
- Loads join trips one-to-one. Delivery events and costs use separate datasets to prevent duplicate revenue.
- MPG is total miles divided by total trip fuel gallons; zero gallons returns null.
- On-time event rate includes pickup and delivery events, with a separate event-type breakdown.
- Utilization is an unweighted mean of truck-month records. Costs include fuel and maintenance, not all business expenses.
- Stale means IN_TRANSIT without an update for 24 hours, not ETA-based lateness.
- Historical imports and live FleetFlow shipments are separate populations. Live charts may be empty.
- SQL excludes user credentials, personal driver details, fuel card numbers, actor emails and internal notes.

All queries are versioned in `superset/datasets.json`. Database connections request read-only transactions and a 60-second statement timeout. Set `SUPERSET_DATABASE_URL` before setup to use a dedicated SELECT-only account instead of the app connection.

## Deployment

This Compose configuration uses SQLite for local Superset metadata. Production needs PostgreSQL metadata, HTTPS, managed secrets and a dedicated SELECT-only source account. `FLEETFLOW_ORIGIN` controls embedding allowlists and CSP; recreate the container after changing it. `NEXT_PUBLIC_SUPERSET_URL` must be browser accessible. The analytics embed ID is independent of the existing network-map ID.

The SDK refreshes five-minute guest tokens. The dashboard refresh interval is five minutes. FleetFlow shows a retry state when unavailable; non-admin tokens are denied.

References: [Superset Docker deployment](https://superset.apache.org/docs/installation/docker-compose/) and [creating dashboards](https://superset.apache.org/docs/6.0.0/using-superset/creating-your-first-dashboard/).
