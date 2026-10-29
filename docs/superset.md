# Apache Superset network map

FleetFlow supports an optional embedded Apache Superset dashboard for a richer operational map and analytics layer. When Superset is not configured or the guest-token request fails, the landing page automatically shows the built-in FleetFlow branch map.

## Local Superset quickstart

The official local quickstart assumes Docker, Docker Compose, and Git. Run this outside the FleetFlow repository:

```powershell
git clone https://github.com/apache/superset
cd superset
git checkout tags/6.0.0
docker compose -f docker-compose-image-tag.yml up
```

Then open [http://localhost:8088](http://localhost:8088) and sign in with the development account from the quickstart:

```text
username: admin
password: admin
```

After local verification, stop it with `docker compose down`. The official guide describes this Compose setup as suitable for sandbox/development use, not production. For FleetFlow local embedding, use:

```env
SUPERSET_URL=http://localhost:8088
NEXT_PUBLIC_SUPERSET_URL=http://localhost:8088
```

## Superset preparation

1. Enable the `EMBEDDED_SUPERSET` feature flag in Superset.
2. Create a dashboard containing a geospatial chart based on the FleetFlow `Branch` data (`latitude`, `longitude`, branch name, active state, and shipment volume).
3. Use **Dashboard → Embed** to obtain the dashboard UUID.
4. Add the FleetFlow origin to the dashboard's allowed domains, such as `http://localhost:3000`.
5. Create a least-privilege Superset service account that can mint guest tokens and access only this dashboard/dataset.

## FleetFlow environment

```env
SUPERSET_URL=https://superset.example.com
SUPERSET_DASHBOARD_ID=dashboard-uuid
SUPERSET_USERNAME=fleetflow-embed-service
SUPERSET_PASSWORD=service-account-password
NEXT_PUBLIC_SUPERSET_URL=https://superset.example.com
NEXT_PUBLIC_SUPERSET_DASHBOARD_ID=dashboard-uuid
```

The browser calls FleetFlow's `/api/superset/guest-token`; it never receives the Superset service-account password. FleetFlow authenticates the current user before minting the short-lived guest token.
