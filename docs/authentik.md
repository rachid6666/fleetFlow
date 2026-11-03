# Authentik OIDC setup

FleetFlow uses Authentik as an OpenID Connect provider through Auth.js. Authentik recommends creating an Application and OAuth2/OIDC Provider together from **Applications → Applications → New Application**. Configure the provider for the authorization-code flow and add the callback URL:

```text
http://localhost:3000/api/auth/callback/authentik
```

For production, replace the host with the deployed FleetFlow URL.

## Run a local Authentik server with Docker Desktop

The local stack definition is [`../authentik/compose.yml`](../authentik/compose.yml), based on Authentik's official Compose file. It runs Authentik's server, worker, and a dedicated PostgreSQL container. This PostgreSQL database is separate from FleetFlow's Neon database. Generated credentials are stored in the ignored `authentik/.env`; do not commit or share that file.

Start Docker Desktop and confirm its Linux engine is ready:

```powershell
docker info
```

From the repository root, start the stack:

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

To stop Authentik without deleting its database or uploaded files:

```powershell
docker compose -f authentik/compose.yml down
```

Do not use `docker compose down -v` unless you intend to delete Authentik's persistent database volume.

## FleetFlow sign-in branding

The local Authentik default brand is configured with the FleetFlow title and sign-in flow. To recreate or adjust it, open **System → Brands**, edit the default brand, set its title to `FleetFlow | Logistics operations`, and upload [`../authentik/fleetflow-logo.svg`](../authentik/fleetflow-logo.svg) as the logo. Paste [`../authentik/fleetflow-brand.css`](../authentik/fleetflow-brand.css) into the brand's **Custom CSS** field. In **Flows and Stages → Flows**, edit `default-authentication-flow` and set its title to `Welcome to FleetFlow`.

These settings are stored in Authentik's database volume and remain local to this Authentik instance.

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
```

The issuer must be the Authentik application/provider issuer. Authentik’s default per-provider issuer follows `/application/o/<application_slug>/` and exposes OIDC discovery from that issuer. Requesting `openid email profile groups` lets FleetFlow map the Authentik group claim to its application roles.

If `groups` is not present in the ID token or UserInfo response, add an Authentik scope mapping that emits the user’s group names as the `groups` claim, then include that mapping in the provider’s selected scopes.

## Role mapping

- Member of `AUTHENTIK_ADMIN_GROUP` → `ADMIN`
- Member of `AUTHENTIK_DRIVER_GROUP` → `DRIVER`
- Any other authenticated user → `CUSTOMER`

Admin routes require `ADMIN`. Driver routes accept `DRIVER` or `ADMIN`. Public tracking remains available without login.

## Production notes

- Use HTTPS for the deployed callback URL.
- Keep `AUTHENTIK_SECRET` and `AUTH_SECRET` outside Git.
- Confirm the Authentik proxy/firewall allows server-to-server access to the discovery and JWKS endpoints.
- The current role is derived from the OIDC group claim at sign-in. Authentik users are not currently synchronized into FleetFlow's Prisma `User` table; add a sign-in callback or provisioning service if application-level user records are required.
