---
type: "query"
date: "2026-11-23T13:27:20.154884+00:00"
question: "im trying to log in to admin but got issues 303"
contributor: "graphify"
outcome: "useful"
source_nodes: ["LoginPage()", "AUTHENTIK_ISSUER", "roleFromGroups()"]
---

# Q: im trying to log in to admin but got issues 303

## Answer

Expanded from the original query using graph vocabulary: authentik, issuer, authorization, login, admin, groups, role.
The failure occurs at Authentik password validation. A read-only password-hash check through Authentik's configured Neon database rejected the user-supplied password for the active akadmin account. The account already belongs to FleetFlow Admins and the configured profile scope emits group names. End-to-end admin login remains unverified.
Separately, FleetFlow is running through next dev on Windows. Its local AUTHENTIK_ISSUER used host.docker.internal, which returned ENOTFOUND. The local .env issuer was changed to http://localhost:9000/application/o/fleet/. Discovery and JWKS checks returned HTTP 200 and the discovered issuer matches the configuration. The app health check reports database ok. HTTP 303 is the expected Next.js server-action sign-in redirect.
The user clarified that the task is to identify the issue and supplied a password for diagnosis.

## Outcome

- Signal: useful

## Source Nodes

- LoginPage()
- AUTHENTIK_ISSUER
- roleFromGroups()
