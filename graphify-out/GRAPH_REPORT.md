# Graph Report - NO-CODE project  (2026-11-18)

## Corpus Check
- 95 files · ~37,447 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 7, .css 3, .example 2)

## Summary
- 563 nodes · 1054 edges · 27 communities (22 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc496464`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- next
- import-kaggle.ts
- environment
- data.ts
- [trackingCode]/handover/route.ts
- superset
- app/page.tsx
- verify.py
- package.json
- auth
- environment
- compilerOptions
- scripts
- shipments/page.tsx
- app
- dependencies
- status-actions.tsx
- n8n
- environment
- healthcheck
- interface
- @neon/config
- prisma
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `auth` - 48 edges
2. `next` - 41 edges
3. `environment` - 21 edges
4. `Sidebar()` - 19 edges
5. `scripts` - 18 edges
6. `DriverPage()` - 17 edges
7. `compilerOptions` - 16 edges
8. `react` - 15 edges
9. `environment` - 12 edges
10. `environment` - 12 edges

## Surprising Connections (you probably didn't know these)
- `CopilotPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/copilot/page.tsx → auth.ts
- `POST()` --calls--> `auth`  [EXTRACTED]
  src/app/api/copilot/route.ts → auth.ts
- `GET()` --calls--> `auth`  [EXTRACTED]
  src/app/api/customer/shipments/export/route.ts → auth.ts
- `PATCH()` --calls--> `auth`  [EXTRACTED]
  src/app/api/drivers/availability/route.ts → auth.ts
- `GET()` --calls--> `auth`  [EXTRACTED]
  src/app/api/shipments/route.ts → auth.ts

## Import Cycles
- None detected.

## Communities (27 total, 5 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.07
Nodes (45): CopilotPage(), dynamic, AdminPage(), dynamic, askOllama(), chooseModels(), dynamic, fallbackAnswer() (+37 more)

### Community 1 - "next"
Cohesion: 0.08
Nodes (32): nextConfig, next, react, DriversPage(), dynamic, dynamic, GET(), CustomerPage() (+24 more)

### Community 2 - "import-kaggle.ts"
Cohesion: 0.09
Nodes (26): BatchCreator, boolean(), CsvRow, date(), decimal(), getSourceDirectory(), importCsv(), integer() (+18 more)

### Community 3 - "environment"
Cohesion: 0.09
Nodes (30): AUTHENTIK_POSTGRESQL__CONN_MAX_AGE, AUTHENTIK_POSTGRESQL__DIRECT__HOST, AUTHENTIK_POSTGRESQL__DISABLE_SERVER_SIDE_CURSORS, AUTHENTIK_POSTGRESQL__HOST, AUTHENTIK_POSTGRESQL__NAME, AUTHENTIK_POSTGRESQL__PASSWORD, AUTHENTIK_POSTGRESQL__PORT, AUTHENTIK_POSTGRESQL__SSLMODE (+22 more)

### Community 4 - "data.ts"
Cohesion: 0.06
Nodes (47): zod@^4.1.0, zod, availabilitySchema, PATCH(), createShipmentSchema, GET(), POST(), Context (+39 more)

### Community 5 - "[trackingCode]/handover/route.ts"
Cohesion: 0.07
Nodes (30): eventSchema, POST(), Context, inputSchema, POST(), Context, GET(), allowedTypes (+22 more)

### Community 6 - "superset"
Cohesion: 0.08
Nodes (23): SUPERSET_CONFIG_PATH, external, name, interval, retries, test, timeout, name (+15 more)

### Community 7 - "app/page.tsx"
Cohesion: 0.23
Nodes (9): HomePage(), HeroVideoSlider(), slides, SupersetNetworkMap(), labelOffsets, project(), WorldMap(), activeBranches (+1 more)

### Community 8 - "verify.py"
Cohesion: 0.11
Nodes (3): provision(), chart(), metric()

### Community 9 - "package.json"
Cohesion: 0.13
Nodes (20): devDependencies, eslint@^9.33.0, eslint-config-next@^15.5.0, prisma@^6.17.0, tsx@^4.20.0, @types/node@^22.15.0, @types/react@^19.1.0, @types/react-dom@^19.1.0 (+12 more)

### Community 10 - "auth"
Cohesion: 0.08
Nodes (32): auth, AuthentikProfile, handlers, signIn, signOut, UserRole, next-auth@^5.0.0-beta.32, next-auth (+24 more)

### Community 11 - "environment"
Cohesion: 0.11
Nodes (19): environment, AUTH_SECRET, AUTH_URL, AUTHENTIK_ADMIN_GROUP, AUTHENTIK_AUTHORIZATION_URL, AUTHENTIK_DRIVER_GROUP, AUTHENTIK_ID, AUTHENTIK_ISSUER (+11 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:deploy, db:generate, db:import:kaggle, db:migrate, db:seed, db:seed:tracking (+10 more)

### Community 14 - "shipments/page.tsx"
Cohesion: 0.21
Nodes (7): dynamic, ShipmentsPage(), CreateShipmentButton(), DriverAssignment(), StatusBadge(), getShipmentFormOptions(), ShipmentFormOptions

### Community 15 - "app"
Cohesion: 0.15
Nodes (13): build, depends_on, env_file, extra_hosts, networks, ports, context, dockerfile (+5 more)

### Community 16 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, csv-parse@^7.0.3, @neon/env@^1.6.8, next@^15.5.0, @prisma/client@^6.17.0, react@^19.1.0, react-dom@^19.1.0, @superset-ui/embedded-sdk@^0.3.0 (+5 more)

### Community 17 - "status-actions.tsx"
Cohesion: 0.27
Nodes (9): StatusActions(), StatusBadgeFallback(), transitionLabel(), assertTransition(), canTransition(), getAvailableTransitions(), InvalidShipmentTransitionError, transitions (+1 more)

### Community 18 - "n8n"
Cohesion: 0.17
Nodes (11): name, image, networks, ports, volumes, networks, fleetflow, services (+3 more)

### Community 19 - "environment"
Cohesion: 0.18
Nodes (11): FLEETFLOW_API_URL, N8N_BLOCK_ENV_ACCESS_IN_NODE, N8N_ENCRYPTION_KEY, N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS, N8N_HOST, N8N_PORT, N8N_PROTOCOL, N8N_SECURE_COOKIE (+3 more)

### Community 20 - "healthcheck"
Cohesion: 0.53
Nodes (6): healthcheck, interval, retries, test, timeout, healthcheck

### Community 21 - "interface"
Cohesion: 0.40
Nodes (4): interface, default_prompt, display_name, short_description

## Knowledge Gaps
- **1 isolated node(s):** `{ GET, POST }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 244 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `types.ts`, `data.ts`, `[trackingCode]/handover/route.ts`, `app/page.tsx`, `package.json`, `auth`, `shipments/page.tsx`, `dependencies`, `status-actions.tsx`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **What connects `{ GET, POST }` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07039187227866474 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `import-kaggle.ts` to `types.ts`, `data.ts`, `[trackingCode]/handover/route.ts`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.07518796992481203 - nodes in this community are weakly interconnected._
- **Why does `auth` connect `auth` to `types.ts`, `next`, `data.ts`, `[trackingCode]/handover/route.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `import-kaggle.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08907563025210084 - nodes in this community are weakly interconnected._