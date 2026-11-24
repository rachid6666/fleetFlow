# Graph Report - NO-CODE project  (2026-11-23)

## Corpus Check
- 114 files · ~66,097 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 7, .css 3, .example 2)

## Summary
- 1985 nodes · 4127 edges · 112 communities (89 shown, 23 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `48b35035`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RecordPaymentButton
- next
- @prisma/client
- environment
- data.ts
- import-kaggle.ts
- superset
- vf
- verify.py
- package.json
- subdividePolygonInternal
- environment
- compilerOptions
- scripts
- admin/page.tsx
- app
- dependencies
- n8n
- environment
- healthcheck
- __
- interface
- dm
- qg
- { GET, POST }
- P
- evaluate
- createIndex
- parse
- writeMessage
- populate
- readPackedEnd
- writeTag
- bx
- l
- de
- next
- overwriteGetter
- _renderedMath
- constructor
- setValue
- types.ts
- mapcn-network-map.tsx
- i
- ie
- queryIntersectsFeature
- hu
- gp
- D
- admin/page.tsx
- clone
- hasDebugData
- Ee
- ld
- n
- ha
- ho
- evaluate
- Ax
- dv
- pv
- eh
- ab
- ca
- T
- Vt
- intersects
- ft
- fire
- vy
- app/layout.tsx
- seed-tracking.ts
- ld
- Ll
- n8n
- update
- recalculate
- _getByteView
- sidebar-navigation.tsx
- ve
- ty
- tracking.ts
- paint
- dh
- _refreshViews
- queryRadius
- vl
- Ig
- fu
- sortFeatures
- _unit
- interpolationFactor
- withinInto
- addSymbols
- angleWith
- containsMaxSafeIntegerValues
- cr
- crossFadingFactor
- deserializeCollisionBoxes
- dist
- Do
- expandBy
- fromLngLat
- getGlobalStateRefs
- hasOffscreenPass
- Hr
- layout
- patchUpdatedImage
- extend
- once

## God Nodes (most connected - your core abstractions)
1. `__` - 1291 edges
2. `auth` - 54 edges
3. `constructor()` - 48 edges
4. `n()` - 47 edges
5. `next` - 47 edges
6. `l()` - 40 edges
7. `i()` - 24 edges
8. `Sidebar()` - 24 edges
9. `emplaceBack()` - 23 edges
10. `environment` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AnalyticsPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/analytics/page.tsx → auth.ts
- `CopilotPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/copilot/page.tsx → auth.ts
- `POST()` --calls--> `auth`  [EXTRACTED]
  src/app/api/copilot/route.ts → auth.ts
- `GET()` --calls--> `auth`  [EXTRACTED]
  src/app/api/shipments/[trackingCode]/route.ts → auth.ts
- `PATCH()` --calls--> `auth`  [EXTRACTED]
  src/app/api/shipments/[trackingCode]/route.ts → auth.ts

## Import Cycles
- None detected.

## Communities (112 total, 23 thin omitted)

### Community 0 - "RecordPaymentButton"
Cohesion: 0.40
Nodes (4): RecordPaymentButton(), closeDialog(), handleDialogKeyDown(), RecordPaymentButtonProps

### Community 1 - "next"
Cohesion: 0.13
Nodes (19): react, DriverPage(), dynamic, AssignmentResponseActions(), DeliveryNoteForm(), DeliveryProofUpload(), formatFileSize(), ShipmentFilterForm() (+11 more)

### Community 2 - "@prisma/client"
Cohesion: 0.18
Nodes (13): pg@^8.23.1, @prisma/client@^6.17.0, main(), prisma, pg, @prisma/client, AuthentikGlobal, closeAuthentikDirectoryPool() (+5 more)

### Community 3 - "environment"
Cohesion: 0.09
Nodes (30): AUTHENTIK_POSTGRESQL__CONN_MAX_AGE, AUTHENTIK_POSTGRESQL__DIRECT__HOST, AUTHENTIK_POSTGRESQL__DISABLE_SERVER_SIDE_CURSORS, AUTHENTIK_POSTGRESQL__HOST, AUTHENTIK_POSTGRESQL__NAME, AUTHENTIK_POSTGRESQL__PASSWORD, AUTHENTIK_POSTGRESQL__PORT, AUTHENTIK_POSTGRESQL__SSLMODE (+22 more)

### Community 4 - "data.ts"
Cohesion: 0.06
Nodes (49): zod@^4.1.0, zod, availabilitySchema, PATCH(), createShipmentSchema, GET(), POST(), Context (+41 more)

### Community 5 - "import-kaggle.ts"
Cohesion: 0.06
Nodes (39): BatchCreator, boolean(), CsvRow, date(), decimal(), getSourceDirectory(), importCsv(), integer() (+31 more)

### Community 6 - "superset"
Cohesion: 0.08
Nodes (23): SUPERSET_CONFIG_PATH, external, name, interval, retries, test, timeout, name (+15 more)

### Community 7 - "vf"
Cohesion: 0.11
Nodes (29): ap(), bf(), Ef(), ep(), _f(), getUnpackVector(), gf(), hf() (+21 more)

### Community 8 - "verify.py"
Cohesion: 0.11
Nodes (3): provision(), chart(), metric()

### Community 9 - "package.json"
Cohesion: 0.11
Nodes (24): devDependencies, eslint@^9.33.0, eslint-config-next@^15.5.0, prisma@^6.17.0, tsx@^4.20.0, @types/node@^22.15.0, @types/pg@^8.23.1, @types/react@^19.1.0 (+16 more)

### Community 10 - "subdividePolygonInternal"
Cohesion: 0.11
Nodes (23): _ensureNoPoleVertices(), _fillPoles(), _generateInterEdgeVertices(), _generateIntraEdgeVertices(), _generateOutline(), _generatePoleQuad(), _getKey(), _handlePoles() (+15 more)

### Community 11 - "environment"
Cohesion: 0.10
Nodes (21): environment, AUTH_SECRET, AUTH_URL, AUTHENTIK_ADMIN_GROUP, AUTHENTIK_AUTHORIZATION_URL, AUTHENTIK_CUSTOMER_GROUP, AUTHENTIK_DRIVER_GROUP, AUTHENTIK_ID (+13 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, db:deploy, db:generate, db:import:kaggle, db:migrate, db:seed, db:seed:tracking (+11 more)

### Community 14 - "admin/page.tsx"
Cohesion: 0.08
Nodes (42): AnalyticsPage(), dynamic, CopilotPage(), dynamic, DriversPage(), dynamic, dynamic, PaymentsPage() (+34 more)

### Community 15 - "app"
Cohesion: 0.15
Nodes (13): build, depends_on, env_file, extra_hosts, networks, ports, context, dockerfile (+5 more)

### Community 16 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, csv-parse@^7.0.3, lucide-react@^1.78.0, maplibre-gl@^6.19.0, @neon/config@^1.10.0, @neon/env@^1.6.8, next@^15.5.0, next-auth@^5.0.0-beta.32 (+10 more)

### Community 17 - "n8n"
Cohesion: 0.29
Nodes (6): name, networks, fleetflow, services, volumes, fleetflow-n8n

### Community 18 - "environment"
Cohesion: 0.18
Nodes (11): FLEETFLOW_API_URL, N8N_BLOCK_ENV_ACCESS_IN_NODE, N8N_ENCRYPTION_KEY, N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS, N8N_HOST, N8N_PORT, N8N_PROTOCOL, N8N_SECURE_COOKIE (+3 more)

### Community 19 - "healthcheck"
Cohesion: 0.53
Nodes (6): healthcheck, interval, retries, test, timeout, healthcheck

### Community 20 - "__"
Cohesion: 0.01
Nodes (106): __, a_, Af, an, at, B, Bf, bg (+98 more)

### Community 21 - "interface"
Cohesion: 0.40
Nodes (4): interface, default_prompt, display_name, short_description

### Community 22 - "dm"
Cohesion: 0.16
Nodes (21): am(), bm(), cm(), dm(), Em(), fm(), Gm(), Hm() (+13 more)

### Community 24 - "qg"
Cohesion: 0.20
Nodes (10): addTextSection(), _appendSection(), C_(), E_(), _g(), qg(), S_(), w_() (+2 more)

### Community 27 - "P"
Cohesion: 0.08
Nodes (38): as(), completeTask(), cs(), ds(), _filterGeoJSON(), _finishRequestTiming(), fs(), _getEtagUnmodifiedResult() (+30 more)

### Community 28 - "evaluate"
Cohesion: 0.31
Nodes (9): Dt(), fn(), Gt(), interpolate(), jt(), kt(), Ot(), pn() (+1 more)

### Community 29 - "createIndex"
Cohesion: 0.07
Nodes (36): addTileFeatures(), appendLeaves(), Ch(), clipToWorld(), cluster(), createIndex(), createTree(), filterUpdate() (+28 more)

### Community 30 - "parse"
Cohesion: 0.25
Nodes (9): concat(), hasPaintOverride(), ji(), kn(), parse(), pt(), ut(), wa() (+1 more)

### Community 31 - "writeMessage"
Cohesion: 0.17
Nodes (12): J_(), q_(), writeMessage(), writePackedBoolean(), writePackedDouble(), writePackedFixed32(), writePackedFixed64(), writePackedFloat() (+4 more)

### Community 32 - "populate"
Cohesion: 0.08
Nodes (29): addLineDashDependencies(), Bg(), calculateGlyphDependencies(), _convertFromCellCoord(), _convertToCellCoord(), df(), ff(), _forEachCell() (+21 more)

### Community 33 - "readPackedEnd"
Cohesion: 0.10
Nodes (25): nextField(), readBoolean(), readBytes(), readDouble(), readFields(), readFixed32(), readFixed64(), readFloat() (+17 more)

### Community 34 - "writeTag"
Cohesion: 0.12
Nodes (25): realloc(), writeBoolean(), writeBooleanField(), writeBytes(), writeBytesField(), writeDouble(), writeDoubleField(), writeFixed32() (+17 more)

### Community 35 - "bx"
Cohesion: 0.08
Nodes (27): Bb(), bx(), cx(), Gb(), gx(), Hb(), Ib(), jx() (+19 more)

### Community 36 - "l"
Cohesion: 0.17
Nodes (16): anchorPoint(), _C(), cC(), ey(), gC(), getTilePoint(), getVertex(), hC() (+8 more)

### Community 37 - "de"
Cohesion: 0.18
Nodes (20): g_(), b(), d(), de(), en(), $t(), _e(), f() (+12 more)

### Community 38 - "next"
Cohesion: 0.08
Nodes (29): auth, AuthentikProfile, handlers, signIn, signOut, UserRole, nextConfig, next (+21 more)

### Community 39 - "overwriteGetter"
Cohesion: 0.22
Nodes (11): At(), Ct(), Et(), hcl(), lab(), mt(), oklab(), oklch() (+3 more)

### Community 40 - "_renderedMath"
Cohesion: 0.25
Nodes (18): A(), getBounds(), getCameraAltitude(), getCameraFrustum(), getCameraQueryGeometry(), getClippingPlane(), getFastPathSimpleProjectionMatrix(), getVisibleUnwrappedCoordinates() (+10 more)

### Community 41 - "constructor"
Cohesion: 0.11
Nodes (20): addImages(), constructor(), _down(), Dy(), _getAvailableImages(), _getDEMWorkerSource(), _getGlobalState(), _getLayerIndex() (+12 more)

### Community 42 - "setValue"
Cohesion: 0.16
Nodes (16): applyGlobalStateChange(), decodeDictionary(), el(), getTransition(), getValue(), getValueFromBuffer(), offsetToLengthBuffer(), _propertyRootKey() (+8 more)

### Community 43 - "types.ts"
Cohesion: 0.09
Nodes (29): CustomerPage(), CustomerPageProps, CustomerShipmentCard(), dynamic, CopilotClient(), ask(), submit(), Message (+21 more)

### Community 44 - "mapcn-network-map.tsx"
Cohesion: 0.07
Nodes (28): lucide-react, maplibre-gl, HomePage(), HeroVideoSlider(), slides, ATTENTION_COLORS, buildTrailData(), createShipmentMarker() (+20 more)

### Community 45 - "i"
Cohesion: 0.05
Nodes (61): ai(), bi(), Br(), ci(), di(), dr(), dw(), ei() (+53 more)

### Community 46 - "ie"
Cohesion: 0.17
Nodes (15): cd(), fd(), getRayDirectionFromPixel(), id(), ie(), isLocationOccluded(), Ku(), maxPitchScaleFactor() (+7 more)

### Community 47 - "queryIntersectsFeature"
Cohesion: 0.18
Nodes (15): Al(), Bl(), Fl(), Il(), im(), jd(), kd(), Ml() (+7 more)

### Community 48 - "hu"
Cohesion: 0.21
Nodes (15): be(), bu(), calculateFogMatrix(), calculateScaledKey(), emplaceBack(), g(), getProjectionData(), getProjectionDataForCustomLayer() (+7 more)

### Community 49 - "gp"
Cohesion: 0.25
Nodes (8): _generateSideFaces(), gp(), Kp(), push(), qp(), _up(), wl(), Wp()

### Community 50 - "D"
Cohesion: 0.28
Nodes (9): Au(), cu(), D(), eu(), k(), meterInMercatorCoordinateUnits(), transformLightDirection(), wu() (+1 more)

### Community 51 - "admin/page.tsx"
Cohesion: 0.14
Nodes (16): expectedCounts, main(), AdminPage(), BellIcon(), dynamic, emptyAlerts, emptyDashboard, emptyFacilityLocations (+8 more)

### Community 52 - "clone"
Cohesion: 0.15
Nodes (13): add(), clone(), div(), divByPoint(), matMult(), mult(), multByPoint(), perp() (+5 more)

### Community 53 - "hasDebugData"
Cohesion: 0.17
Nodes (13): _addCollisionDebugVertex(), addCollisionDebugVertices(), addDebugCollisionBoxes(), destroy(), destroyDebugData(), generateCollisionDebugBuffers(), getVertexAttributes(), hasDebugData() (+5 more)

### Community 54 - "Ee"
Cohesion: 0.14
Nodes (14): addFeatures(), addImageSection(), _colorRampChanged(), _createColorRamp(), createNewSegment(), detectSdfPatterns(), Ee(), getColorRampTextures() (+6 more)

### Community 55 - "ld"
Cohesion: 0.18
Nodes (14): C(), de(), du(), getCircleRadiusCorrection(), getPitchedTextCorrection(), getPixelScale(), he(), ld() (+6 more)

### Community 56 - "n"
Cohesion: 0.29
Nodes (10): aw(), cw(), getClusterChildren(), getClusterLeaves(), n(), lw(), ow(), sw() (+2 more)

### Community 57 - "ha"
Cohesion: 0.32
Nodes (8): Ba(), Ga(), ha(), la(), pa(), qi(), ya(), za()

### Community 58 - "ho"
Cohesion: 0.08
Nodes (32): ao(), co(), ea(), eo(), fo(), getValueAndResolveTokens(), go(), ho() (+24 more)

### Community 59 - "evaluate"
Cohesion: 0.17
Nodes (12): An(), _calculate(), Dn(), evaluate(), fa(), ge(), ja(), ki() (+4 more)

### Community 60 - "Ax"
Cohesion: 0.07
Nodes (28): aC(), Ax(), bC(), bs(), containsPolygonGeometry(), dx(), eC(), ex() (+20 more)

### Community 61 - "dv"
Cohesion: 0.06
Nodes (45): A_(), Ag(), bv(), cv(), D_(), determineLineBreaks(), determineTotalWidth(), dv() (+37 more)

### Community 62 - "pv"
Cohesion: 0.10
Nodes (26): addFeature(), av(), bp(), Cp(), f(), Fp(), fx(), geometry() (+18 more)

### Community 63 - "eh"
Cohesion: 0.25
Nodes (11): ah(), eh(), ih(), jh(), kh(), Lh(), nh(), oh() (+3 more)

### Community 64 - "ab"
Cohesion: 0.20
Nodes (10): ab(), cb(), db(), fb(), _getOverzoomTile(), lb(), ob(), pb() (+2 more)

### Community 65 - "ca"
Cohesion: 0.33
Nodes (7): aa(), ca(), Da(), oa(), qn(), sa(), ua()

### Community 66 - "T"
Cohesion: 0.20
Nodes (11): Ae(), cn(), fe(), gg(), je(), ln(), S(), sn() (+3 more)

### Community 67 - "Vt"
Cohesion: 0.39
Nodes (8): Bt(), displayP3(), ht(), Tt(), Vt(), Xt(), Yt(), zt()

### Community 68 - "intersects"
Cohesion: 0.18
Nodes (13): covers(), distance(), empty(), getEast(), getNorth(), getNorthWest(), getSouth(), getSouthEast() (+5 more)

### Community 69 - "ft"
Cohesion: 0.50
Nodes (5): checkSubtype(), error(), ft(), _parse(), r()

### Community 70 - "fire"
Cohesion: 0.15
Nodes (14): fire(), gradientExpression(), _handleOverridablePaintPropertyUpdate(), _handleSpecialPaintPropertyUpdate(), listens(), off(), on(), recalculateVisibility() (+6 more)

### Community 71 - "vy"
Cohesion: 0.19
Nodes (12): b(), by(), Cy(), gy(), ly(), py(), uy(), vy() (+4 more)

### Community 73 - "seed-tracking.ts"
Cohesion: 0.31
Nodes (9): facilityFor(), FacilityLocation, heading(), interpolate(), main(), prisma, routeLabel(), routes (+1 more)

### Community 74 - "ld"
Cohesion: 0.15
Nodes (18): ad(), ce(), dd(), E(), ed(), fg(), getCameraLngLat(), gu() (+10 more)

### Community 75 - "Ll"
Cohesion: 0.67
Nodes (3): fy(), Ll(), Rl()

### Community 76 - "n8n"
Cohesion: 0.33
Nodes (6): extra_hosts, image, networks, ports, volumes, n8n

### Community 78 - "update"
Cohesion: 0.28
Nodes (9): qd(), replace(), rf(), tb(), update(), _updateDomImage(), _updateRawData(), _uploadDomImage() (+1 more)

### Community 81 - "_getByteView"
Cohesion: 0.29
Nodes (8): backfillBorder(), get(), _getByteView(), getPixels(), _idx(), sampleBilinear(), unpack(), _unpackAtIndex()

### Community 82 - "sidebar-navigation.tsx"
Cohesion: 0.18
Nodes (10): NavigationIcon(), NavigationIconName, roleLinks, SidebarNavigation(), AppRole, next-auth, next-auth/jwt, JWT (+2 more)

### Community 83 - "ve"
Cohesion: 0.10
Nodes (26): addCurrentVertex(), addHalfVertex(), addLine(), emplace(), _findLatitudeLimit(), _finiteInverse(), getPositionIds(), getPositions() (+18 more)

### Community 86 - "ty"
Cohesion: 0.33
Nodes (6): ay(), iy(), Nv(), ny(), ry(), ty()

### Community 87 - "tracking.ts"
Cohesion: 0.14
Nodes (22): askOllama(), chooseModels(), dynamic, fallbackAnswer(), listOllamaModels(), ollamaBaseUrl(), OllamaMessage, POST() (+14 more)

### Community 90 - "paint"
Cohesion: 0.33
Nodes (6): paint(), qy(), tf(), tg(), tm(), Zd()

### Community 93 - "dh"
Cohesion: 0.40
Nodes (5): dh(), fh(), finish(), ph(), uh()

### Community 94 - "_refreshViews"
Cohesion: 0.40
Nodes (5): freeBufferAfterUpload(), _refreshViews(), reserve(), resize(), _trim()

### Community 96 - "queryRadius"
Cohesion: 0.50
Nodes (4): bd(), og(), queryRadius(), xd()

### Community 97 - "vl"
Cohesion: 0.67
Nodes (3): Hl(), _l(), vl()

### Community 98 - "Ig"
Cohesion: 0.50
Nodes (4): Dg(), Ig(), jg(), Ng()

### Community 101 - "sortFeatures"
Cohesion: 0.67
Nodes (3): addIndicesForPlacedSymbol(), getSortedSymbolIndexes(), sortFeatures()

### Community 102 - "_unit"
Cohesion: 0.67
Nodes (3): _div(), mag(), _unit()

### Community 104 - "interpolationFactor"
Cohesion: 0.67
Nodes (3): interpolationFactor(), Yn(), Zn()

### Community 105 - "withinInto"
Cohesion: 0.67
Nodes (3): mh(), within(), withinInto()

## Knowledge Gaps
- **1 isolated node(s):** `{ GET, POST }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 631 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `AdminPage()` (3× useful, score=2.991297245) _(code changed — re-verify)_
- `SupersetAnalytics()` (2× useful, score=1.994307487) _(code changed — re-verify)_
- `getLogisticsDashboard()` (2× useful, score=1.994169964) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `__` connect `__` to `vf`, `subdividePolygonInternal`, `dm`, `qg`, `P`, `evaluate`, `createIndex`, `parse`, `writeMessage`, `populate`, `readPackedEnd`, `writeTag`, `bx`, `l`, `de`, `overwriteGetter`, `_renderedMath`, `constructor`, `setValue`, `i`, `ie`, `queryIntersectsFeature`, `hu`, `gp`, `D`, `clone`, `hasDebugData`, `Ee`, `ld`, `n`, `ha`, `ho`, `evaluate`, `Ax`, `dv`, `pv`, `eh`, `ab`, `ca`, `T`, `Vt`, `intersects`, `ft`, `fire`, `vy`, `ld`, `Ll`, `update`, `recalculate`, `_getByteView`, `ve`, `ty`, `paint`, `dh`, `_refreshViews`, `queryRadius`, `vl`, `Ig`, `fu`, `sortFeatures`, `_unit`, `interpolationFactor`, `withinInto`, `addSymbols`, `angleWith`, `containsMaxSafeIntegerValues`, `cr`, `crossFadingFactor`, `deserializeCollisionBoxes`, `dist`, `Do`, `expandBy`, `fromLngLat`, `getGlobalStateRefs`, `hasOffscreenPass`, `Hr`, `layout`, `patchUpdatedImage`, `extend`, `once`?**
  _High betweenness centrality (0.449) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `__` (e.g. with `ao()` and `ar()`) actually correct?**
  _`__` has 34 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ GET, POST }` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.12903225806451613 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `RecordPaymentButton`, `next`, `data.ts`, `import-kaggle.ts`, `app/layout.tsx`, `package.json`, `types.ts`, `mapcn-network-map.tsx`, `admin/page.tsx`, `dependencies`, `sidebar-navigation.tsx`, `admin/page.tsx`, `tracking.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `constructor()` (e.g. with `n()` and `i()`) actually correct?**
  _`constructor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `environment` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._