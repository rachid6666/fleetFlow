---
name: fleetflow-local-setup
description: Use for FleetFlow fresh clones, Docker Compose startup, local environment variables, Prisma migrations, repeatable seed data, and setup troubleshooting.
---

# FleetFlow local setup

1. Inspect `README.md`, `.env.example`, `docker-compose.yml`, `package.json`, and `prisma/schema.prisma` before changing setup.
2. Keep local values in `.env`; keep Vercel/hosted database values out of local Compose files.
3. Start with `docker compose up --build`; let the app container run `prisma migrate deploy` and `npm run db:seed`.
4. Use Compose service names (`postgres`, `app`, `n8n`) inside containers and `localhost` only from the host browser.
5. Verify `/api/health`, `docker compose ps`, Prisma validation, and seed repeatability. Never remove the named database volume automatically.
