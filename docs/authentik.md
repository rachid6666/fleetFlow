# Authentik OIDC setup

FleetFlow uses Authentik as an OpenID Connect provider through Auth.js. Authentik recommends creating an Application and OAuth2/OIDC Provider together from **Applications → Applications → New Application**. Configure the provider for the authorization-code flow and add the callback URL:

```text
http://localhost:3000/api/auth/callback/authentik
```

For production, replace the host with the deployed FleetFlow URL.

## Run Authentik with Neon

Authentik uses its own Neon database named `authentik`, separate from FleetFlow's `fleet` database. Docker runs only the Authentik server and worker; there is no local PostgreSQL container.

1. Create the separate `authentik` database in the same Neon project or another Neon project.
2. Copy the example environment file and fill in the Neon values:

   ```powershell
   Copy-Item authentik/.env.example authentik/.env
   ```

   - `PG_HOST`: Neon pooled endpoint with `-pooler` in the hostname.
   - `PG_DIRECT_HOST`: Neon direct endpoint without `-pooler`.
   - `PG_DB`: `authentik`.
   - `PG_USER` and `PG_PASS`: the Neon role credentials.
   - `PG_SSLMODE`: `require`.

3. Start Authentik:

   ```powershell
   docker compose -f authentik/compose.yml pull
   docker compose -f authentik/compose.yml up -d
   docker compose -f authentik/compose.yml ps
   ```

The HTTP and HTTPS ports bind to localhost only:

- Authentik: http://localhost:9000
- Authentik HTTPS: https://localhost:9443

Complete the initial setup at http://localhost:9000/if/flow/initial-setup/, then create the FleetFlow application and OAuth2/OIDC provider. Set the provider's redirect URI to `http://localhost:3000/api/auth/callback/authentik`, and configure its authorization-code flow and `groups` claim as described below.

Copy the issuer, client ID, and client secret from the new provider into the app's root `.env`. The local issuer is prefilled as a starting point; replace it with the exact issuer shown by the provider if its slug differs. Restart FleetFlow after changing `.env`.

### Neon migration workaround

Authentik 2026.8 can leave a startup advisory lock open when it runs migrations against external PostgreSQL. The Compose file therefore defaults `AUTHENTIK_SKIP_MIGRATIONS` to `true`; the long-running server and worker do not attempt to migrate on every restart.

When upgrading Authentik, run migrations once against the direct Neon endpoint:

```powershell
docker compose -f authentik/compose.yml stop worker
$env:AUTHENTIK_SKIP_MIGRATIONS="false"
docker compose -f authentik/compose.yml up -d --force-recreate server
docker compose -f authentik/compose.yml logs -f server
```

After the server is healthy, remove the temporary override and recreate both services:

```powershell
Remove-Item Env:AUTHENTIK_SKIP_MIGRATIONS
docker compose -f authentik/compose.yml up -d --force-recreate server worker
```

To stop Authentik without changing Neon data:

```powershell
docker compose -f authentik/compose.yml down
```

## FleetFlow sign-in branding

The local Authentik default brand is configured with the FleetFlow title and sign-in flow. To recreate or adjust it, open **System → Brands**, edit the default brand, set its title to `FleetFlow | Logistics operations`, and upload [`../authentik/fleetflow-logo.svg`](../authentik/fleetflow-logo.svg) as the logo. Paste [`../authentik/fleetflow-brand.css`](../authentik/fleetflow-brand.css) into the brand's **Custom CSS** field. In **Flows and Stages → Flows**, edit `default-authentication-flow` and set its title to `Welcome to FleetFlow`.

These settings are stored in Authentik's Neon database and remain associated with that deployment.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```text
AUTH_SECRET=<long-random-secret>
AUTH_URL=http://localhost:3000
AUTHENTIK_ISSUER=https://authentik.example.com/application/o/fleetflow/
AUTHENTIK_ID=<client-id>
AUTHENTIK_SECRET=<client-secret>
AUTHENTIK_ADMIN_GROUP=FleetFlow Admins
AUTHENTIK_DRIVER_GROUP=FleetFlow Drivers
AUTHENTIK_CUSTOMER_GROUP=FleetFlow Customers
AUTHENTIK_DB_HOST=<pooled-authentik-host>
AUTHENTIK_DB_PORT=5432
AUTHENTIK_DB_NAME=authentik
AUTHENTIK_DB_USER=<database-user>
AUTHENTIK_DB_PASSWORD=<database-password>
AUTHENTIK_DB_SSLMODE=require
```

The issuer must be the Authentik application/provider issuer. Authentik’s default per-provider issuer follows `/application/o/<application_slug>/` and exposes OIDC discovery from that issuer. Requesting `openid email profile groups` lets FleetFlow map the Authentik group claim to its application roles.

If `groups` is not present in the ID token or UserInfo response, add an Authentik scope mapping that emits the user’s group names as the `groups` claim, then include that mapping in the provider’s selected scopes.

## Role mapping

- Member of `AUTHENTIK_ADMIN_GROUP` → `ADMIN`
- Member of `AUTHENTIK_DRIVER_GROUP` → `DRIVER`
- Any other authenticated user → `CUSTOMER`

After sign-in, `/workspace` redirects `ADMIN` to `/admin`, `DRIVER` to `/driver`, and `CUSTOMER` to `/customer`. Each workspace is restricted to its matching role, and customers can view only shipments linked to their Authentik email.

## Production notes

- Use HTTPS for the deployed callback URL.
- Keep `AUTHENTIK_SECRET` and `AUTH_SECRET` outside Git.
- Confirm the Authentik proxy/firewall allows server-to-server access to the discovery and JWKS endpoints.
- Active members of the FleetFlow Drivers and FleetFlow Customers groups are synchronized into FleetFlow's Prisma `User` table as identity projections. The synchronization runs when shipment form options are requested and through `npm run db:seed`; shipment relations still use FleetFlow's local user IDs while names, emails, and roles come from Authentik.
