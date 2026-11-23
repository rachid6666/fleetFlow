# Graph Report - NO-CODE project  (2026-11-23)

## Corpus Check
- 102 files · ~56,175 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 7, .css 3, .example 2)

## Summary
- 1931 nodes · 3949 edges · 112 communities (90 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5eeb222`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- next
- @prisma/client
- environment
- data.ts
- proof/route.ts
- superset
- app/page.tsx
- verify.py
- package.json
- auth
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
- determineLineBreaks
- { GET, POST }
- P
- types.ts
- createIndex
- vf
- ei
- populate
- readPackedEnd
- writeTag
- bx
- l
- de
- auth.ts
- overwriteGetter
- _renderedMath
- constructor
- setValue
- Bl
- mapcn-network-map.tsx
- pw
- [trackingCode]/handover/route.ts
- dx
- hu
- hx
- ve
- import-kaggle.ts
- clone
- hasDebugData
- Ee
- parse
- n
- status-actions.tsx
- ho
- writeMessage
- aC
- prisma.ts
- emplaceBack
- evaluate
- app/layout.tsx
- subdividePolygonInternal
- qg
- fire
- uo
- seed-tracking.ts
- ab
- du
- intersects
- interpolate
- _setPaintValues
- update
- setup.mjs
- ha
- _getByteView
- lngLatFromWorld
- gp
- ca
- ty
- paint
- dh
- _refreshViews
- queryRadius
- Ig
- Fp
- sortFeatures
- _unit
- getClusterLeaves
- interpolationFactor
- withinInto
- addSymbols
- angleWith
- containsMaxSafeIntegerValues
- cr
- crossFadingFactor
- i
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
2. `constructor()` - 48 edges
3. `n()` - 47 edges
4. `auth` - 44 edges
5. `next` - 41 edges
6. `l()` - 40 edges
7. `i()` - 24 edges
8. `emplaceBack()` - 23 edges
9. `_renderedMath()` - 21 edges
10. `yu()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `auth`  [EXTRACTED]
  src/app/api/copilot/route.ts → auth.ts
- `GET()` --calls--> `auth`  [EXTRACTED]
  src/app/api/tracking/live/route.ts → auth.ts
- `DriverPage()` --calls--> `auth`  [EXTRACTED]
  src/app/driver/page.tsx → auth.ts
- `GET()` --calls--> `auth`  [EXTRACTED]
  src/app/api/superset/guest-token/route.ts → auth.ts
- `AnalyticsPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/analytics/page.tsx → auth.ts

## Import Cycles
- None detected.

## Communities (112 total, 22 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.10
Nodes (30): CopilotPage(), dynamic, askOllama(), chooseModels(), dynamic, fallbackAnswer(), listOllamaModels(), ollamaBaseUrl() (+22 more)

### Community 1 - "next"
Cohesion: 0.09
Nodes (28): DriverPage(), dynamic, AssignmentResponseActions(), DeliveryNoteForm(), DeliveryProofUpload(), formatFileSize(), DriverAvailabilityControl(), ShipmentFilterForm() (+20 more)

### Community 2 - "@prisma/client"
Cohesion: 0.18
Nodes (8): @prisma/client@^6.17.0, branches, prisma, expectedCounts, main(), prisma, @prisma/client, getLogisticsDashboard()

### Community 3 - "environment"
Cohesion: 0.09
Nodes (30): AUTHENTIK_POSTGRESQL__CONN_MAX_AGE, AUTHENTIK_POSTGRESQL__DIRECT__HOST, AUTHENTIK_POSTGRESQL__DISABLE_SERVER_SIDE_CURSORS, AUTHENTIK_POSTGRESQL__HOST, AUTHENTIK_POSTGRESQL__NAME, AUTHENTIK_POSTGRESQL__PASSWORD, AUTHENTIK_POSTGRESQL__PORT, AUTHENTIK_POSTGRESQL__SSLMODE (+22 more)

### Community 4 - "data.ts"
Cohesion: 0.07
Nodes (43): zod@^4.1.0, zod, availabilitySchema, PATCH(), createShipmentSchema, GET(), POST(), Context (+35 more)

### Community 5 - "proof/route.ts"
Cohesion: 0.27
Nodes (7): allowedTypes, Context, matchesFileSignature(), POST(), proofDirectory, removeDeliveryProof(), saveDeliveryProof()

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
Cohesion: 0.12
Nodes (22): devDependencies, eslint@^9.33.0, eslint-config-next@^15.5.0, prisma@^6.17.0, tsx@^4.20.0, @types/node@^22.15.0, @types/react@^19.1.0, @types/react-dom@^19.1.0 (+14 more)

### Community 10 - "auth"
Cohesion: 0.10
Nodes (24): auth, nextConfig, next, AdminLayout(), GET(), pingSchema, POST(), CustomerPage() (+16 more)

### Community 11 - "environment"
Cohesion: 0.11
Nodes (19): environment, AUTH_SECRET, AUTH_URL, AUTHENTIK_ADMIN_GROUP, AUTHENTIK_AUTHORIZATION_URL, AUTHENTIK_DRIVER_GROUP, AUTHENTIK_ID, AUTHENTIK_ISSUER (+11 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:deploy, db:generate, db:import:kaggle, db:migrate, db:seed, db:seed:tracking (+10 more)

### Community 14 - "admin/page.tsx"
Cohesion: 0.13
Nodes (20): react, AnalyticsPage(), dynamic, DriversPage(), dynamic, dynamic, ShipmentsPage(), MetricCard() (+12 more)

### Community 15 - "app"
Cohesion: 0.15
Nodes (13): build, depends_on, env_file, extra_hosts, networks, ports, context, dockerfile (+5 more)

### Community 16 - "dependencies"
Cohesion: 0.13
Nodes (14): dependencies, csv-parse@^7.0.3, @neon/config@^1.10.0, @neon/env@^1.6.8, next@^15.5.0, react@^19.1.0, react-dom@^19.1.0, @superset-ui/embedded-sdk@^0.3.0 (+6 more)

### Community 17 - "n8n"
Cohesion: 0.17
Nodes (11): name, image, networks, ports, volumes, networks, fleetflow, services (+3 more)

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
Nodes (20): am(), bm(), cm(), dm(), Em(), fm(), Gm(), Hm() (+12 more)

### Community 24 - "determineLineBreaks"
Cohesion: 0.06
Nodes (45): A_(), Ag(), bv(), cv(), D_(), determineLineBreaks(), determineTotalWidth(), dv() (+37 more)

### Community 27 - "P"
Cohesion: 0.06
Nodes (50): as(), Ax(), bs(), completeTask(), cs(), ds(), eC(), _filterGeoJSON() (+42 more)

### Community 28 - "types.ts"
Cohesion: 0.14
Nodes (14): AdminPage(), BellIcon(), dynamic, emptyAlerts, emptyDashboard, emptyFacilityLocations, emptyLiveTracking, colors (+6 more)

### Community 29 - "createIndex"
Cohesion: 0.06
Nodes (47): addTileFeatures(), ah(), appendLeaves(), Ch(), clipToWorld(), cluster(), createIndex(), createTree() (+39 more)

### Community 30 - "vf"
Cohesion: 0.10
Nodes (32): ap(), bf(), Cp(), Ef(), ep(), _f(), getUnpackVector(), gf() (+24 more)

### Community 31 - "ei"
Cohesion: 0.11
Nodes (30): bi(), Br(), ci(), di(), Dn(), dr(), ei(), fi() (+22 more)

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
Cohesion: 0.09
Nodes (24): Bb(), bx(), Gb(), gx(), Hb(), Ib(), jx(), Kb() (+16 more)

### Community 36 - "l"
Cohesion: 0.11
Nodes (24): anchorPoint(), _C(), calculateScaledKey(), cC(), ey(), gC(), getTilePoint(), getVertex() (+16 more)

### Community 37 - "de"
Cohesion: 0.18
Nodes (20): g_(), b(), d(), de(), en(), $t(), _e(), f() (+12 more)

### Community 38 - "auth.ts"
Cohesion: 0.10
Nodes (17): AuthentikProfile, handlers, signIn, signOut, UserRole, next-auth@^5.0.0-beta.32, next-auth, Context (+9 more)

### Community 39 - "overwriteGetter"
Cohesion: 0.16
Nodes (18): At(), Bt(), Ct(), displayP3(), Et(), hcl(), ht(), lab() (+10 more)

### Community 40 - "_renderedMath"
Cohesion: 0.15
Nodes (32): A(), ad(), ce(), D(), dd(), ed(), getBounds(), getCameraAltitude() (+24 more)

### Community 41 - "constructor"
Cohesion: 0.10
Nodes (22): addImages(), constructor(), _down(), Dy(), _getAvailableImages(), _getDEMWorkerSource(), _getGlobalState(), _getLayerIndex() (+14 more)

### Community 42 - "setValue"
Cohesion: 0.15
Nodes (17): applyGlobalStateChange(), decodeDictionary(), el(), getTransition(), getValue(), getValueFromBuffer(), offsetToLengthBuffer(), _propertyRootKey() (+9 more)

### Community 43 - "Bl"
Cohesion: 0.15
Nodes (16): Al(), Bl(), Fl(), fy(), Hl(), Il(), _l(), Ll() (+8 more)

### Community 44 - "mapcn-network-map.tsx"
Cohesion: 0.10
Nodes (20): lucide-react@^1.78.0, maplibre-gl@^6.19.0, lucide-react, maplibre-gl, ATTENTION_COLORS, buildTrailData(), createShipmentMarker(), MapcnLiveFleetMap() (+12 more)

### Community 45 - "pw"
Cohesion: 0.12
Nodes (24): dw(), eS(), ew(), gw(), hw(), iC(), iw(), jw() (+16 more)

### Community 46 - "[trackingCode]/handover/route.ts"
Cohesion: 0.22
Nodes (13): eventSchema, POST(), Context, inputSchema, POST(), getAccessActor(), emitHandoverEvent(), HandoverInput (+5 more)

### Community 47 - "dx"
Cohesion: 0.29
Nodes (7): dx(), ex(), Jb(), rx(), tx(), Xb(), Yb()

### Community 48 - "hu"
Cohesion: 0.21
Nodes (14): be(), bu(), calculateFogMatrix(), fu(), g(), getProjectionData(), getProjectionDataForCustomLayer(), hu() (+6 more)

### Community 49 - "hx"
Cohesion: 0.21
Nodes (14): addFeature(), bp(), Fp(), fx(), hx(), lineFeatureClips(), loadGeometry(), mx() (+6 more)

### Community 50 - "ve"
Cohesion: 0.14
Nodes (16): cd(), fd(), id(), ie(), isLocationOccluded(), Ku(), lu(), maxPitchScaleFactor() (+8 more)

### Community 51 - "import-kaggle.ts"
Cohesion: 0.31
Nodes (11): BatchCreator, boolean(), CsvRow, date(), decimal(), getSourceDirectory(), importCsv(), integer() (+3 more)

### Community 52 - "clone"
Cohesion: 0.15
Nodes (13): add(), clone(), div(), divByPoint(), matMult(), mult(), multByPoint(), perp() (+5 more)

### Community 53 - "hasDebugData"
Cohesion: 0.17
Nodes (13): _addCollisionDebugVertex(), addCollisionDebugVertices(), addDebugCollisionBoxes(), destroy(), destroyDebugData(), generateCollisionDebugBuffers(), getVertexAttributes(), hasDebugData() (+5 more)

### Community 54 - "Ee"
Cohesion: 0.08
Nodes (29): addFeatures(), addImageSection(), ai(), b(), by(), _colorRampChanged(), _createColorRamp(), createNewSegment() (+21 more)

### Community 55 - "parse"
Cohesion: 0.15
Nodes (16): checkSubtype(), concat(), ea(), error(), ft(), hasPaintOverride(), ji(), kn() (+8 more)

### Community 56 - "n"
Cohesion: 0.22
Nodes (13): aw(), cw(), n(), im(), jd(), kd(), lw(), ow() (+5 more)

### Community 57 - "status-actions.tsx"
Cohesion: 0.19
Nodes (13): Context, PATCH(), updateSchema, StatusActions(), StatusBadgeFallback(), transitionLabel(), transitionShipmentStatus(), assertTransition() (+5 more)

### Community 58 - "ho"
Cohesion: 0.08
Nodes (29): ao(), co(), eo(), getValueAndResolveTokens(), go(), ho(), ia(), ja() (+21 more)

### Community 59 - "writeMessage"
Cohesion: 0.17
Nodes (12): J_(), q_(), writeMessage(), writePackedBoolean(), writePackedDouble(), writePackedFixed32(), writePackedFixed64(), writePackedFloat() (+4 more)

### Community 60 - "aC"
Cohesion: 0.22
Nodes (9): aC(), bC(), containsPolygonGeometry(), geometryType(), getGeometries(), jC(), OC(), SC() (+1 more)

### Community 62 - "emplaceBack"
Cohesion: 0.11
Nodes (27): Ae(), Au(), av(), cu(), E(), emplaceBack(), eu(), f() (+19 more)

### Community 63 - "evaluate"
Cohesion: 0.25
Nodes (8): An(), _calculate(), evaluate(), fa(), ge(), ki(), Oi(), possiblyEvaluate()

### Community 67 - "subdividePolygonInternal"
Cohesion: 0.10
Nodes (28): addCurrentVertex(), addHalfVertex(), addLine(), _ensureNoPoleVertices(), _fillPoles(), _generateInterEdgeVertices(), _generateIntraEdgeVertices(), _generateOutline() (+20 more)

### Community 69 - "qg"
Cohesion: 0.20
Nodes (10): addTextSection(), _appendSection(), C_(), E_(), _g(), qg(), S_(), w_() (+2 more)

### Community 70 - "fire"
Cohesion: 0.15
Nodes (14): fire(), gradientExpression(), _handleOverridablePaintPropertyUpdate(), _handleSpecialPaintPropertyUpdate(), listens(), off(), on(), recalculateVisibility() (+6 more)

### Community 71 - "uo"
Cohesion: 0.67
Nodes (3): fo(), po(), uo()

### Community 72 - "seed-tracking.ts"
Cohesion: 0.28
Nodes (8): cities, City, heading(), interpolate(), main(), prisma, routes, SyntheticRoute

### Community 73 - "ab"
Cohesion: 0.22
Nodes (9): ab(), cb(), db(), fb(), _getOverzoomTile(), lb(), ob(), sb() (+1 more)

### Community 74 - "du"
Cohesion: 0.15
Nodes (15): C(), cn(), de(), du(), getCircleRadiusCorrection(), getPitchedTextCorrection(), getPixelScale(), gg() (+7 more)

### Community 75 - "intersects"
Cohesion: 0.18
Nodes (13): covers(), distance(), empty(), getEast(), getNorth(), getNorthWest(), getSouth(), getSouthEast() (+5 more)

### Community 76 - "interpolate"
Cohesion: 0.31
Nodes (9): Dt(), fn(), Gt(), interpolate(), jt(), kt(), Ot(), pn() (+1 more)

### Community 77 - "_setPaintValues"
Cohesion: 0.28
Nodes (9): emplace(), getPositionIds(), getPositions(), Kc(), ol(), populatePaintArray(), _setPaintValue(), _setPaintValues() (+1 more)

### Community 78 - "update"
Cohesion: 0.28
Nodes (9): qd(), replace(), rf(), tb(), update(), _updateDomImage(), _updateRawData(), _uploadDomImage() (+1 more)

### Community 79 - "setup.mjs"
Cohesion: 0.22
Nodes (5): databaseUrl, env, settings, sourceUrl, updates

### Community 80 - "ha"
Cohesion: 0.32
Nodes (8): Ba(), Ga(), ha(), la(), pa(), qi(), ya(), za()

### Community 81 - "_getByteView"
Cohesion: 0.29
Nodes (8): backfillBorder(), get(), _getByteView(), getPixels(), _idx(), sampleBilinear(), unpack(), _unpackAtIndex()

### Community 83 - "lngLatFromWorld"
Cohesion: 0.32
Nodes (8): _findLatitudeLimit(), _finiteInverse(), hasLngLat(), _inverse(), _inverseTowardCenter(), latitudeRange(), lngLatFromWorld(), _meridianStretch()

### Community 84 - "gp"
Cohesion: 0.25
Nodes (8): _generateSideFaces(), gp(), Kp(), push(), qp(), _up(), wl(), Wp()

### Community 85 - "ca"
Cohesion: 0.33
Nodes (7): aa(), ca(), Da(), oa(), qn(), sa(), ua()

### Community 86 - "ty"
Cohesion: 0.33
Nodes (6): ay(), iy(), Nv(), ny(), ry(), ty()

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

### Community 98 - "Ig"
Cohesion: 0.50
Nodes (4): Dg(), Ig(), jg(), Ng()

### Community 99 - "Fp"
Cohesion: 0.67
Nodes (3): geometry(), projectLine(), projectPoint()

### Community 101 - "sortFeatures"
Cohesion: 0.67
Nodes (3): addIndicesForPlacedSymbol(), getSortedSymbolIndexes(), sortFeatures()

### Community 102 - "_unit"
Cohesion: 0.67
Nodes (3): _div(), mag(), _unit()

### Community 103 - "getClusterLeaves"
Cohesion: 0.67
Nodes (3): getClusterChildren(), getClusterLeaves(), _toLngLat()

### Community 104 - "interpolationFactor"
Cohesion: 0.67
Nodes (3): interpolationFactor(), Yn(), Zn()

### Community 105 - "withinInto"
Cohesion: 0.67
Nodes (3): mh(), within(), withinInto()

### Community 111 - "i"
Cohesion: 0.20
Nodes (10): cx(), fw(), kx(), mt(), i(), updatePaintArrays(), wi(), ww() (+2 more)

## Knowledge Gaps
- **1 isolated node(s):** `{ GET, POST }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 614 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `__` connect `__` to `dm`, `determineLineBreaks`, `P`, `createIndex`, `vf`, `ei`, `populate`, `readPackedEnd`, `writeTag`, `bx`, `l`, `de`, `overwriteGetter`, `_renderedMath`, `constructor`, `setValue`, `Bl`, `pw`, `dx`, `hu`, `hx`, `ve`, `clone`, `hasDebugData`, `Ee`, `parse`, `n`, `ho`, `writeMessage`, `aC`, `emplaceBack`, `evaluate`, `subdividePolygonInternal`, `qg`, `fire`, `uo`, `ab`, `du`, `intersects`, `interpolate`, `_setPaintValues`, `update`, `ha`, `_getByteView`, `lngLatFromWorld`, `gp`, `ca`, `ty`, `paint`, `dh`, `_refreshViews`, `queryRadius`, `Ig`, `Fp`, `sortFeatures`, `_unit`, `getClusterLeaves`, `interpolationFactor`, `withinInto`, `addSymbols`, `angleWith`, `containsMaxSafeIntegerValues`, `cr`, `crossFadingFactor`, `i`, `deserializeCollisionBoxes`, `dist`, `Do`, `expandBy`, `fromLngLat`, `getGlobalStateRefs`, `hasOffscreenPass`, `Hr`, `layout`, `patchUpdatedImage`, `extend`, `once`?**
  _High betweenness centrality (0.448) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `__` (e.g. with `ao()` and `ar()`) actually correct?**
  _`__` has 34 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ GET, POST }` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09915966386554621 - nodes in this community are weakly interconnected._
- **Why does `next` connect `auth` to `types.ts`, `next`, `app/layout.tsx`, `data.ts`, `proof/route.ts`, `auth.ts`, `app/page.tsx`, `package.json`, `admin/page.tsx`, `[trackingCode]/handover/route.ts`, `dependencies`, `status-actions.tsx`, `types.ts`, `prisma.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `constructor()` (e.g. with `n()` and `i()`) actually correct?**
  _`constructor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.0919661733615222 - nodes in this community are weakly interconnected._