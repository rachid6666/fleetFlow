# Graph Report - NO-CODE project  (2026-11-23)

## Corpus Check
- 112 files · ~65,681 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 7, .css 3, .example 2)

## Summary
- 1980 nodes · 4109 edges · 118 communities (94 shown, 24 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e3fc19d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- next
- next
- @prisma/client
- environment
- data.ts
- [trackingCode]/handover/route.ts
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
- react
- mapcn-network-map.tsx
- i
- ie
- queryIntersectsFeature
- hu
- gp
- D
- by
- clone
- hasDebugData
- Ee
- prisma.ts
- n
- ha
- ho
- mapcn-live-fleet-map.tsx
- aC
- dv
- pv
- import-kaggle.ts
- lngLatFromWorld
- ca
- T
- _vertexToIndex
- intersects
- dx
- fire
- vy
- proof/route.ts
- seed-tracking.ts
- ld
- addFeature
- n8n
- setup.mjs
- update
- iv
- recalculate
- _getByteView
- customer/page.tsx
- _setPaintValues
- addLine
- ty
- tracking.ts
- MapcnNetworkMap
- paint
- dh
- _refreshViews
- queryRadius
- vl
- Ig
- Fp
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
- getClusterLeaves
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
5. `next` - 46 edges
6. `l()` - 40 edges
7. `i()` - 24 edges
8. `environment` - 23 edges
9. `emplaceBack()` - 23 edges
10. `Sidebar()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `getLogisticsDashboard()`  [EXTRACTED]
  prisma/verify-kaggle.ts → src/lib/data.ts
- `DriverPage()` --calls--> `auth`  [EXTRACTED]
  src/app/driver/page.tsx → auth.ts
- `AnalyticsPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/analytics/page.tsx → auth.ts
- `CopilotPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/copilot/page.tsx → auth.ts
- `Sidebar()` --calls--> `auth`  [EXTRACTED]
  src/components/sidebar.tsx → auth.ts

## Import Cycles
- None detected.

## Communities (118 total, 24 thin omitted)

### Community 0 - "next"
Cohesion: 0.10
Nodes (12): nextConfig, next, react, AnalyticsPage(), dynamic, metadata, RecordPaymentButton(), closeDialog() (+4 more)

### Community 1 - "next"
Cohesion: 0.08
Nodes (36): DriverPage(), dynamic, AssignmentResponseActions(), DeliveryNoteForm(), DeliveryProofUpload(), formatFileSize(), ShipmentFilterForm(), ShipmentPagination() (+28 more)

### Community 2 - "@prisma/client"
Cohesion: 0.16
Nodes (13): @prisma/client@^6.17.0, main(), prisma, expectedCounts, main(), @prisma/client, AuthentikGlobal, closeAuthentikDirectoryPool() (+5 more)

### Community 3 - "environment"
Cohesion: 0.09
Nodes (30): AUTHENTIK_POSTGRESQL__CONN_MAX_AGE, AUTHENTIK_POSTGRESQL__DIRECT__HOST, AUTHENTIK_POSTGRESQL__DISABLE_SERVER_SIDE_CURSORS, AUTHENTIK_POSTGRESQL__HOST, AUTHENTIK_POSTGRESQL__NAME, AUTHENTIK_POSTGRESQL__PASSWORD, AUTHENTIK_POSTGRESQL__PORT, AUTHENTIK_POSTGRESQL__SSLMODE (+22 more)

### Community 4 - "data.ts"
Cohesion: 0.07
Nodes (39): createShipmentSchema, GET(), POST(), Context, PATCH(), responseSchema, Context, GET() (+31 more)

### Community 5 - "[trackingCode]/handover/route.ts"
Cohesion: 0.20
Nodes (13): eventSchema, POST(), Context, inputSchema, POST(), getAccessActor(), emitHandoverEvent(), HandoverInput (+5 more)

### Community 6 - "superset"
Cohesion: 0.08
Nodes (23): SUPERSET_CONFIG_PATH, external, name, interval, retries, test, timeout, name (+15 more)

### Community 7 - "vf"
Cohesion: 0.09
Nodes (35): ap(), bf(), _colorRampChanged(), Cp(), _createColorRamp(), Ef(), ep(), _f() (+27 more)

### Community 8 - "verify.py"
Cohesion: 0.11
Nodes (3): provision(), chart(), metric()

### Community 9 - "package.json"
Cohesion: 0.11
Nodes (24): devDependencies, eslint@^9.33.0, eslint-config-next@^15.5.0, prisma@^6.17.0, tsx@^4.20.0, @types/node@^22.15.0, @types/pg@^8.23.1, @types/react@^19.1.0 (+16 more)

### Community 10 - "subdividePolygonInternal"
Cohesion: 0.22
Nodes (10): _ensureNoPoleVertices(), _initializeVertices(), pu(), _removeLinesOutsideTileX(), _removeTrianglesOutsideTileX(), subdividePolygonInternal(), _subdivideTrianglesScanline(), _vertexOutsideTileX() (+2 more)

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
Cohesion: 0.09
Nodes (42): DriversPage(), dynamic, AdminPage(), BellIcon(), dynamic, emptyAlerts, emptyDashboard, emptyFacilityLocations (+34 more)

### Community 15 - "app"
Cohesion: 0.15
Nodes (13): build, depends_on, env_file, extra_hosts, networks, ports, context, dockerfile (+5 more)

### Community 16 - "dependencies"
Cohesion: 0.11
Nodes (17): dependencies, csv-parse@^7.0.3, maplibre-gl@^6.19.0, @neon/config@^1.10.0, @neon/env@^1.6.8, next@^15.5.0, pg@^8.23.1, react@^19.1.0 (+9 more)

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
Cohesion: 0.10
Nodes (32): ah(), am(), bm(), cm(), dm(), eh(), Em(), fm() (+24 more)

### Community 24 - "qg"
Cohesion: 0.20
Nodes (10): addTextSection(), _appendSection(), C_(), E_(), _g(), qg(), S_(), w_() (+2 more)

### Community 27 - "P"
Cohesion: 0.08
Nodes (40): as(), completeTask(), cs(), ds(), _filterGeoJSON(), _finishRequestTiming(), fs(), _getEtagUnmodifiedResult() (+32 more)

### Community 28 - "evaluate"
Cohesion: 0.17
Nodes (15): An(), Dn(), Dt(), evaluate(), fa(), fn(), Gt(), interpolate() (+7 more)

### Community 29 - "createIndex"
Cohesion: 0.07
Nodes (36): addTileFeatures(), appendLeaves(), Ch(), clipToWorld(), cluster(), createIndex(), createTree(), filterUpdate() (+28 more)

### Community 30 - "parse"
Cohesion: 0.19
Nodes (13): checkSubtype(), concat(), error(), ft(), hasPaintOverride(), ji(), kn(), parse() (+5 more)

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
Cohesion: 0.06
Nodes (37): ab(), Bb(), bx(), cb(), cx(), db(), fb(), Gb() (+29 more)

### Community 36 - "l"
Cohesion: 0.13
Nodes (20): anchorPoint(), _C(), cC(), ey(), gC(), getTilePoint(), getVertex(), hC() (+12 more)

### Community 37 - "de"
Cohesion: 0.18
Nodes (20): g_(), b(), d(), de(), en(), $t(), _e(), f() (+12 more)

### Community 38 - "next"
Cohesion: 0.06
Nodes (41): auth, AuthentikProfile, handlers, signIn, signOut, UserRole, zod@^4.1.0, zod (+33 more)

### Community 39 - "overwriteGetter"
Cohesion: 0.15
Nodes (19): At(), Bt(), Ct(), displayP3(), Et(), hcl(), ht(), lab() (+11 more)

### Community 40 - "_renderedMath"
Cohesion: 0.16
Nodes (25): bu(), fd(), getBounds(), getCameraAltitude(), getCameraFrustum(), getCircleRadiusCorrection(), getClippingPlane(), getFastPathSimpleProjectionMatrix() (+17 more)

### Community 41 - "constructor"
Cohesion: 0.11
Nodes (20): addImages(), constructor(), _down(), Dy(), _getAvailableImages(), _getDEMWorkerSource(), _getGlobalState(), _getLayerIndex() (+12 more)

### Community 42 - "setValue"
Cohesion: 0.15
Nodes (17): applyGlobalStateChange(), decodeDictionary(), el(), getTransition(), getValue(), getValueFromBuffer(), offsetToLengthBuffer(), _propertyRootKey() (+9 more)

### Community 43 - "react"
Cohesion: 0.23
Nodes (9): HomePage(), HeroVideoSlider(), slides, SupersetNetworkMap(), labelOffsets, project(), WorldMap(), activeBranches (+1 more)

### Community 44 - "mapcn-network-map.tsx"
Cohesion: 0.13
Nodes (14): lucide-react@^1.78.0, lucide-react, ATTENTION_COLORS, TrailProperties, MAPCN_MAP_STYLE, MAPCN_STREET_STYLE, MAPCN_WORKER_URL, US_STATES_DATA (+6 more)

### Community 45 - "i"
Cohesion: 0.06
Nodes (58): bi(), Br(), ci(), di(), dr(), dw(), ei(), eS() (+50 more)

### Community 46 - "ie"
Cohesion: 0.15
Nodes (15): cd(), id(), ie(), lu(), maxPitchScaleFactor(), projectTileCoordinates(), rd(), ru() (+7 more)

### Community 47 - "queryIntersectsFeature"
Cohesion: 0.14
Nodes (18): Al(), Bl(), Fl(), fy(), Il(), im(), jd(), kd() (+10 more)

### Community 48 - "hu"
Cohesion: 0.22
Nodes (14): be(), calculateFogMatrix(), calculateScaledKey(), emplaceBack(), g(), getProjectionData(), getProjectionDataForCustomLayer(), hu() (+6 more)

### Community 49 - "gp"
Cohesion: 0.25
Nodes (8): _generateSideFaces(), gp(), Kp(), push(), qp(), _up(), wl(), Wp()

### Community 50 - "D"
Cohesion: 0.22
Nodes (13): Ax(), cu(), D(), eu(), k(), meterInMercatorCoordinateUnits(), nx(), O() (+5 more)

### Community 51 - "by"
Cohesion: 0.22
Nodes (10): by(), Cy(), _generateOutline(), hp(), ly(), mp(), _pointArrayToIndices(), py() (+2 more)

### Community 52 - "clone"
Cohesion: 0.15
Nodes (13): add(), clone(), div(), divByPoint(), matMult(), mult(), multByPoint(), perp() (+5 more)

### Community 53 - "hasDebugData"
Cohesion: 0.17
Nodes (13): _addCollisionDebugVertex(), addCollisionDebugVertices(), addDebugCollisionBoxes(), destroy(), destroyDebugData(), generateCollisionDebugBuffers(), getVertexAttributes(), hasDebugData() (+5 more)

### Community 54 - "Ee"
Cohesion: 0.22
Nodes (10): addImageSection(), createNewSegment(), Ee(), getNextImageSectionCharCode(), getOrCreateLatestSegment(), oy(), prepareSegment(), Sy() (+2 more)

### Community 56 - "n"
Cohesion: 0.29
Nodes (10): aw(), _calculate(), cw(), ge(), n(), lw(), ow(), possiblyEvaluate() (+2 more)

### Community 57 - "ha"
Cohesion: 0.32
Nodes (8): Ba(), Ga(), ha(), la(), pa(), qi(), ya(), za()

### Community 58 - "ho"
Cohesion: 0.07
Nodes (35): ao(), co(), ea(), eo(), fo(), getValueAndResolveTokens(), go(), ho() (+27 more)

### Community 59 - "mapcn-live-fleet-map.tsx"
Cohesion: 0.25
Nodes (5): maplibre-gl, buildTrailData(), createShipmentMarker(), MapcnLiveFleetMap(), initializeMap()

### Community 60 - "aC"
Cohesion: 0.14
Nodes (14): aC(), bC(), containsPolygonGeometry(), eC(), geometryType(), getGeometries(), Ix(), jC() (+6 more)

### Community 61 - "dv"
Cohesion: 0.06
Nodes (45): A_(), Ag(), bv(), cv(), D_(), determineLineBreaks(), determineTotalWidth(), dv() (+37 more)

### Community 62 - "pv"
Cohesion: 0.20
Nodes (14): Ae(), av(), f(), fe(), fx(), hx(), je(), loadGeometry() (+6 more)

### Community 63 - "import-kaggle.ts"
Cohesion: 0.31
Nodes (11): BatchCreator, boolean(), CsvRow, date(), decimal(), getSourceDirectory(), importCsv(), integer() (+3 more)

### Community 64 - "lngLatFromWorld"
Cohesion: 0.32
Nodes (8): _findLatitudeLimit(), _finiteInverse(), hasLngLat(), _inverse(), _inverseTowardCenter(), latitudeRange(), lngLatFromWorld(), _meridianStretch()

### Community 65 - "ca"
Cohesion: 0.33
Nodes (7): aa(), ca(), Da(), oa(), qn(), sa(), ua()

### Community 66 - "T"
Cohesion: 0.40
Nodes (6): cn(), gg(), ln(), sn(), T(), un()

### Community 67 - "_vertexToIndex"
Cohesion: 0.32
Nodes (8): _fillPoles(), _generateInterEdgeVertices(), _generateIntraEdgeVertices(), _generatePoleQuad(), _getKey(), _handlePoles(), _scanlineGenerateVertexRingForCellRow(), _vertexToIndex()

### Community 68 - "intersects"
Cohesion: 0.18
Nodes (13): covers(), distance(), empty(), getEast(), getNorth(), getNorthWest(), getSouth(), getSouthEast() (+5 more)

### Community 69 - "dx"
Cohesion: 0.29
Nodes (7): dx(), ex(), Jb(), rx(), tx(), Xb(), Yb()

### Community 70 - "fire"
Cohesion: 0.13
Nodes (16): bs(), fire(), gradientExpression(), _handleOverridablePaintPropertyUpdate(), _handleSpecialPaintPropertyUpdate(), listens(), off(), on() (+8 more)

### Community 71 - "vy"
Cohesion: 0.25
Nodes (8): addFeatures(), b(), detectSdfPatterns(), gy(), recordSdfPattern(), vy(), _y(), yy()

### Community 72 - "proof/route.ts"
Cohesion: 0.27
Nodes (7): allowedTypes, Context, matchesFileSignature(), POST(), proofDirectory, removeDeliveryProof(), saveDeliveryProof()

### Community 73 - "seed-tracking.ts"
Cohesion: 0.31
Nodes (9): facilityFor(), FacilityLocation, heading(), interpolate(), main(), prisma, routeLabel(), routes (+1 more)

### Community 74 - "ld"
Cohesion: 0.12
Nodes (27): A(), ad(), Au(), C(), ce(), dd(), de(), du() (+19 more)

### Community 75 - "addFeature"
Cohesion: 0.28
Nodes (9): addFeature(), ai(), bp(), ii(), lineFeatureClips(), pp(), processPolygon(), ri() (+1 more)

### Community 76 - "n8n"
Cohesion: 0.33
Nodes (6): extra_hosts, image, networks, ports, volumes, n8n

### Community 77 - "setup.mjs"
Cohesion: 0.25
Nodes (5): databaseUrl, env, settings, sourceUrl, updates

### Community 78 - "update"
Cohesion: 0.28
Nodes (9): qd(), replace(), rf(), tb(), update(), _updateDomImage(), _updateRawData(), _uploadDomImage() (+1 more)

### Community 81 - "_getByteView"
Cohesion: 0.29
Nodes (8): backfillBorder(), get(), _getByteView(), getPixels(), _idx(), sampleBilinear(), unpack(), _unpackAtIndex()

### Community 82 - "customer/page.tsx"
Cohesion: 0.10
Nodes (19): next-auth@^5.0.0-beta.32, next-auth, CustomerPage(), CustomerPageProps, CustomerShipmentCard(), dynamic, NavigationIcon(), NavigationIconName (+11 more)

### Community 83 - "_setPaintValues"
Cohesion: 0.28
Nodes (9): emplace(), getPositionIds(), getPositions(), Kc(), ol(), populatePaintArray(), _setPaintValue(), _setPaintValues() (+1 more)

### Community 84 - "addLine"
Cohesion: 0.70
Nodes (5): addCurrentVertex(), addHalfVertex(), addLine(), updateDistance(), updateScaledDistance()

### Community 86 - "ty"
Cohesion: 0.33
Nodes (6): ay(), iy(), Nv(), ny(), ry(), ty()

### Community 87 - "tracking.ts"
Cohesion: 0.11
Nodes (28): CopilotPage(), dynamic, askOllama(), chooseModels(), dynamic, fallbackAnswer(), listOllamaModels(), ollamaBaseUrl() (+20 more)

### Community 89 - "MapcnNetworkMap"
Cohesion: 0.29
Nodes (3): createFacilityMarker(), MapcnNetworkMap(), initializeMap()

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

### Community 99 - "Fp"
Cohesion: 0.50
Nodes (4): Fp(), geometry(), projectLine(), projectPoint()

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

### Community 115 - "getClusterLeaves"
Cohesion: 0.67
Nodes (3): getClusterChildren(), getClusterLeaves(), _toLngLat()

## Knowledge Gaps
- **1 isolated node(s):** `{ GET, POST }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 630 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `AdminPage()` (3× useful, score=2.991297245)
- `SupersetAnalytics()` (2× useful, score=1.994307487)
- `getLogisticsDashboard()` (2× useful, score=1.994169964) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `__` connect `__` to `vf`, `subdividePolygonInternal`, `dm`, `qg`, `P`, `evaluate`, `createIndex`, `parse`, `writeMessage`, `populate`, `readPackedEnd`, `writeTag`, `bx`, `l`, `de`, `overwriteGetter`, `_renderedMath`, `constructor`, `setValue`, `i`, `ie`, `queryIntersectsFeature`, `hu`, `gp`, `D`, `by`, `clone`, `hasDebugData`, `Ee`, `n`, `ha`, `ho`, `aC`, `dv`, `pv`, `lngLatFromWorld`, `ca`, `T`, `_vertexToIndex`, `intersects`, `dx`, `fire`, `vy`, `ld`, `addFeature`, `update`, `iv`, `recalculate`, `_getByteView`, `_setPaintValues`, `addLine`, `ty`, `paint`, `dh`, `_refreshViews`, `queryRadius`, `vl`, `Ig`, `Fp`, `fu`, `sortFeatures`, `_unit`, `interpolationFactor`, `withinInto`, `addSymbols`, `angleWith`, `containsMaxSafeIntegerValues`, `cr`, `crossFadingFactor`, `deserializeCollisionBoxes`, `dist`, `Do`, `getClusterLeaves`, `expandBy`, `fromLngLat`, `getGlobalStateRefs`, `hasOffscreenPass`, `Hr`, `layout`, `patchUpdatedImage`, `extend`, `once`?**
  _High betweenness centrality (0.482) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `__` (e.g. with `ao()` and `ar()`) actually correct?**
  _`__` has 34 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ GET, POST }` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `next`, `data.ts`, `[trackingCode]/handover/route.ts`, `next`, `proof/route.ts`, `package.json`, `react`, `admin/page.tsx`, `dependencies`, `customer/page.tsx`, `prisma.ts`, `tracking.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `constructor()` (e.g. with `n()` and `i()`) actually correct?**
  _`constructor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.07547169811320754 - nodes in this community are weakly interconnected._