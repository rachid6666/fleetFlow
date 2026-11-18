# Graph Report - src  (2026-11-18)

## Corpus Check
- 57 files · ~15,030 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 275 nodes · 616 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc496464`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ref_next
- types.ts
- data.ts
- driver/page.tsx
- [trackingCode]/handover/route.ts
- shipments/page.tsx
- ref_react
- proof/route.ts
- copilot/route.ts
- drivers/page.tsx
- next-auth.d.ts
- availability/route.ts
- app/layout.tsx
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `Sidebar()` - 17 edges
2. `workspacePathForRole()` - 12 edges
3. `DriverPage()` - 11 edges
4. `toShipment()` - 10 edges
5. `prisma` - 9 edges
6. `getLiveTrackingData()` - 9 edges
7. `ShipmentsPage()` - 7 edges
8. `StatusActions()` - 7 edges
9. `StatusBadge()` - 7 edges
10. `processHandoverEvent()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `CopilotPage()` --calls--> `Sidebar()`  [EXTRACTED]
  src/app/admin/copilot/page.tsx → src/components/sidebar.tsx
- `DriversPage()` --calls--> `Sidebar()`  [EXTRACTED]
  src/app/admin/drivers/page.tsx → src/components/sidebar.tsx
- `AdminLayout()` --calls--> `workspacePathForRole()`  [EXTRACTED]
  src/app/admin/layout.tsx → src/lib/roles.ts
- `AdminPage()` --calls--> `Sidebar()`  [EXTRACTED]
  src/app/admin/page.tsx → src/components/sidebar.tsx
- `ShipmentsPage()` --calls--> `Sidebar()`  [EXTRACTED]
  src/app/admin/shipments/page.tsx → src/components/sidebar.tsx

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "ref_next"
Cohesion: 0.10
Nodes (18): AnalyticsPage(), dynamic, AdminLayout(), dynamic, dynamic, LoginError(), LoginPage(), dynamic (+10 more)

### Community 1 - "types.ts"
Cohesion: 0.08
Nodes (36): CopilotPage(), dynamic, AdminPage(), dynamic, GET(), CopilotClient(), ask(), submit() (+28 more)

### Community 2 - "data.ts"
Cohesion: 0.07
Nodes (34): Context, PATCH(), responseSchema, assignmentSchema, Context, PATCH(), Context, noteSchema (+26 more)

### Community 3 - "driver/page.tsx"
Cohesion: 0.11
Nodes (20): DriverPage(), dynamic, AssignmentResponseActions(), DeliveryNoteForm(), DeliveryProofUpload(), formatFileSize(), StatusActions(), StatusBadgeFallback() (+12 more)

### Community 4 - "[trackingCode]/handover/route.ts"
Cohesion: 0.13
Nodes (16): eventSchema, POST(), Context, inputSchema, POST(), pingSchema, getAccessActor(), emitHandoverEvent() (+8 more)

### Community 5 - "shipments/page.tsx"
Cohesion: 0.13
Nodes (13): dynamic, ShipmentsPage(), createShipmentSchema, GET(), POST(), CustomerPage(), CreateShipmentButton(), DriverAssignment() (+5 more)

### Community 6 - "ref_react"
Cohesion: 0.18
Nodes (10): HomePage(), HeroVideoSlider(), slides, SupersetNetworkMap(), loadDashboard(), labelOffsets, project(), WorldMap() (+2 more)

### Community 7 - "proof/route.ts"
Cohesion: 0.20
Nodes (10): Context, GET(), allowedTypes, Context, matchesFileSignature(), POST(), proofDirectory, readDeliveryProof() (+2 more)

### Community 8 - "copilot/route.ts"
Cohesion: 0.33
Nodes (9): askOllama(), chooseModels(), dynamic, fallbackAnswer(), listOllamaModels(), ollamaBaseUrl(), OllamaMessage, POST() (+1 more)

### Community 9 - "drivers/page.tsx"
Cohesion: 0.36
Nodes (5): DriversPage(), dynamic, Availability, DriverAvailabilityControl(), listDrivers()

### Community 10 - "next-auth.d.ts"
Cohesion: 0.29
Nodes (5): next-auth, next-auth/jwt, JWT, Session, User

### Community 11 - "availability/route.ts"
Cohesion: 0.70
Nodes (4): availabilitySchema, PATCH(), updateDriverAvailability(), updateDriverAvailabilityByEmail()

## Knowledge Gaps
- **1 isolated node(s):** `{ GET, POST }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 92 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Sidebar()` connect `ref_next` to `types.ts`, `driver/page.tsx`, `shipments/page.tsx`, `drivers/page.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `{ GET, POST }` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `ref_next` be split into smaller, more focused modules?**
  _Cohesion score 0.10220673635307782 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `[trackingCode]/handover/route.ts` to `types.ts`, `data.ts`, `proof/route.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._
- **Should `data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07439024390243902 - nodes in this community are weakly interconnected._
- **Should `driver/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11088709677419355 - nodes in this community are weakly interconnected._