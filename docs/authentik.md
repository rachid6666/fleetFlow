# Authentik OIDC setup

FleetFlow uses Authentik as an OpenID Connect provider through Auth.js. Authentik recommends creating an Application and OAuth2/OIDC Provider together from **Applications → Applications → New Application**. Configure the provider for the authorization-code flow and add the callback URL:

```text
http://localhost:3000/api/auth/callback/authentik
```

For production, replace the host with the deployed FleetFlow URL.

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
- The current role is derived from the OIDC group claim at sign-in. When Prisma persistence is enabled, synchronize the user and role inside the sign-in callback or a user-provisioning service.
