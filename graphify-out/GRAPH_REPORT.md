# Graph Report - NO-CODE project  (2026-11-23)

## Corpus Check
- 106 files · ~59,881 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 185 file(s) not represented in the graph (top: (none) 167, .css 3, .example 2)
- WARNING: 185 of 329 files seen (56%) have no supported extractor and are missing from this graph entirely. It may look complete while representing only part of the codebase.

## Summary
- 1937 nodes · 3986 edges · 116 communities (93 shown, 23 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89bc2e14`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tracking.ts
- next
- @prisma/client
- environment
- data.ts
- import-kaggle.ts
- superset
- n
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
- ew
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
- Bl
- mapcn-network-map.tsx
- ei
- ie
- dx
- hu
- addFeature
- Ax
- Vt
- clone
- hasDebugData
- Ee
- parse
- cw
- status-actions.tsx
- ho
- setValue
- aC
- dd
- emplaceBack
- ft
- ud
- addLine
- T
- subdividePolygonInternal
- vl
- qg
- fire
- vy
- _setPaintValues
- @neon/config
- ld
- intersects
- interpolate
- Ll
- update
- ha
- recalculate
- _getByteView
- _down
- lngLatFromWorld
- ca
- ty
- mp
- ve
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
2. `auth` - 50 edges
3. `constructor()` - 48 edges
4. `n()` - 47 edges
5. `next` - 43 edges
6. `l()` - 40 edges
7. `i()` - 24 edges
8. `emplaceBack()` - 23 edges
9. `_renderedMath()` - 21 edges
10. `yu()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `AnalyticsPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/analytics/page.tsx → auth.ts
- `CopilotPage()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/copilot/page.tsx → auth.ts
- `AdminLayout()` --calls--> `auth`  [EXTRACTED]
  src/app/admin/layout.tsx → auth.ts
- `POST()` --calls--> `auth`  [EXTRACTED]
  src/app/api/copilot/route.ts → auth.ts
- `GET()` --calls--> `auth`  [EXTRACTED]
  src/app/api/shipments/route.ts → auth.ts

## Import Cycles
- None detected.

## Communities (116 total, 23 thin omitted)

### Community 0 - "tracking.ts"
Cohesion: 0.10
Nodes (29): CopilotPage(), dynamic, askOllama(), chooseModels(), dynamic, fallbackAnswer(), listOllamaModels(), ollamaBaseUrl() (+21 more)

### Community 1 - "next"
Cohesion: 0.12
Nodes (19): DriverPage(), dynamic, AssignmentResponseActions(), DeliveryNoteForm(), DeliveryProofUpload(), formatFileSize(), ShipmentFilterForm(), ShipmentPagination() (+11 more)

### Community 2 - "@prisma/client"
Cohesion: 0.16
Nodes (14): @prisma/client@^6.17.0, main(), prisma, expectedCounts, main(), @prisma/client, AuthentikGlobal, closeAuthentikDirectoryPool() (+6 more)

### Community 3 - "environment"
Cohesion: 0.09
Nodes (30): AUTHENTIK_POSTGRESQL__CONN_MAX_AGE, AUTHENTIK_POSTGRESQL__DIRECT__HOST, AUTHENTIK_POSTGRESQL__DISABLE_SERVER_SIDE_CURSORS, AUTHENTIK_POSTGRESQL__HOST, AUTHENTIK_POSTGRESQL__NAME, AUTHENTIK_POSTGRESQL__PASSWORD, AUTHENTIK_POSTGRESQL__PORT, AUTHENTIK_POSTGRESQL__SSLMODE (+22 more)

### Community 4 - "data.ts"
Cohesion: 0.07
Nodes (43): zod@^4.1.0, zod, createShipmentSchema, GET(), POST(), Context, PATCH(), responseSchema (+35 more)

### Community 5 - "import-kaggle.ts"
Cohesion: 0.07
Nodes (36): BatchCreator, boolean(), CsvRow, date(), decimal(), getSourceDirectory(), importCsv(), integer() (+28 more)

### Community 6 - "superset"
Cohesion: 0.08
Nodes (23): SUPERSET_CONFIG_PATH, external, name, interval, retries, test, timeout, name (+15 more)

### Community 7 - "n"
Cohesion: 0.14
Nodes (21): aw(), cx(), fw(), n(), jd(), kd(), kx(), i() (+13 more)

### Community 8 - "verify.py"
Cohesion: 0.11
Nodes (3): provision(), chart(), metric()

### Community 9 - "package.json"
Cohesion: 0.11
Nodes (24): devDependencies, eslint@^9.33.0, eslint-config-next@^15.5.0, prisma@^6.17.0, tsx@^4.20.0, @types/node@^22.15.0, @types/pg@^8.23.1, @types/react@^19.1.0 (+16 more)

### Community 10 - "auth"
Cohesion: 0.09
Nodes (25): auth, AuthentikProfile, handlers, signIn, signOut, UserRole, availabilitySchema, PATCH() (+17 more)

### Community 11 - "environment"
Cohesion: 0.11
Nodes (19): environment, AUTH_SECRET, AUTH_URL, AUTHENTIK_ADMIN_GROUP, AUTHENTIK_AUTHORIZATION_URL, AUTHENTIK_DRIVER_GROUP, AUTHENTIK_ID, AUTHENTIK_ISSUER (+11 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, db:deploy, db:generate, db:import:kaggle, db:migrate, db:seed, db:sync:reference (+10 more)

### Community 14 - "admin/page.tsx"
Cohesion: 0.12
Nodes (23): react, AnalyticsPage(), dynamic, DriversPage(), dynamic, dynamic, ShipmentsPage(), MetricCard() (+15 more)

### Community 15 - "app"
Cohesion: 0.15
Nodes (13): build, depends_on, env_file, extra_hosts, networks, ports, context, dockerfile (+5 more)

### Community 16 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, csv-parse@^7.0.3, maplibre-gl@^6.19.0, @neon/env@^1.6.8, next@^15.5.0, next-auth@^5.0.0-beta.32, pg@^8.23.1, react@^19.1.0 (+9 more)

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
Cohesion: 0.09
Nodes (33): ah(), am(), bm(), cm(), dm(), eh(), Em(), filterUpdate() (+25 more)

### Community 24 - "determineLineBreaks"
Cohesion: 0.06
Nodes (45): A_(), Ag(), bv(), cv(), D_(), determineLineBreaks(), determineTotalWidth(), dv() (+37 more)

### Community 27 - "P"
Cohesion: 0.08
Nodes (42): ab(), as(), completeTask(), cs(), ds(), _filterGeoJSON(), _finishRequestTiming(), fs() (+34 more)

### Community 28 - "types.ts"
Cohesion: 0.11
Nodes (25): AdminPage(), BellIcon(), dynamic, emptyAlerts, emptyDashboard, emptyFacilityLocations, emptyLiveTracking, CustomerPage() (+17 more)

### Community 29 - "createIndex"
Cohesion: 0.08
Nodes (34): addTileFeatures(), appendLeaves(), Ch(), clipToWorld(), cluster(), createIndex(), createTree(), getChildren() (+26 more)

### Community 30 - "vf"
Cohesion: 0.10
Nodes (32): ap(), bf(), Cp(), Ef(), ep(), _f(), getUnpackVector(), gf() (+24 more)

### Community 31 - "ew"
Cohesion: 0.15
Nodes (15): dw(), ew(), gw(), hw(), jw(), kS(), mw(), nw() (+7 more)

### Community 32 - "populate"
Cohesion: 0.08
Nodes (29): addLineDashDependencies(), Bg(), calculateGlyphDependencies(), _convertFromCellCoord(), _convertToCellCoord(), df(), ff(), _forEachCell() (+21 more)

### Community 33 - "readPackedEnd"
Cohesion: 0.10
Nodes (25): nextField(), readBoolean(), readBytes(), readDouble(), readFields(), readFixed32(), readFixed64(), readFloat() (+17 more)

### Community 34 - "writeTag"
Cohesion: 0.07
Nodes (37): J_(), q_(), realloc(), writeBoolean(), writeBooleanField(), writeBytes(), writeBytesField(), writeDouble() (+29 more)

### Community 35 - "bx"
Cohesion: 0.07
Nodes (30): Bb(), bx(), cb(), db(), fb(), Gb(), gx(), Hb() (+22 more)

### Community 36 - "l"
Cohesion: 0.12
Nodes (21): anchorPoint(), _C(), cC(), distance(), ey(), gC(), getTilePoint(), getVertex() (+13 more)

### Community 37 - "de"
Cohesion: 0.18
Nodes (20): g_(), b(), d(), de(), en(), $t(), _e(), f() (+12 more)

### Community 38 - "next"
Cohesion: 0.08
Nodes (20): nextConfig, next, AdminLayout(), metadata, dynamic, WorkspacePage(), NavigationIcon(), NavigationIconName (+12 more)

### Community 39 - "overwriteGetter"
Cohesion: 0.22
Nodes (11): At(), Ct(), Et(), hcl(), lab(), mt(), oklab(), oklch() (+3 more)

### Community 40 - "_renderedMath"
Cohesion: 0.20
Nodes (22): A(), calculateFogMatrix(), D(), getCameraAltitude(), getCameraFrustum(), getCameraLngLat(), getCameraQueryGeometry(), getCircleRadiusCorrection() (+14 more)

### Community 41 - "constructor"
Cohesion: 0.12
Nodes (18): addImages(), constructor(), Dy(), _getAvailableImages(), _getDEMWorkerSource(), _getGlobalState(), _getLayerIndex(), _getWorkerSource() (+10 more)

### Community 42 - "setValue"
Cohesion: 0.22
Nodes (10): decodeDictionary(), el(), getTransition(), getValue(), getValueFromBuffer(), offsetToLengthBuffer(), serialize(), tl() (+2 more)

### Community 43 - "Bl"
Cohesion: 0.31
Nodes (9): Al(), Bl(), Fl(), Il(), Ml(), Nl(), Pl(), sm() (+1 more)

### Community 44 - "mapcn-network-map.tsx"
Cohesion: 0.06
Nodes (31): lucide-react@^1.78.0, lucide-react, maplibre-gl, HomePage(), HeroVideoSlider(), slides, ATTENTION_COLORS, buildTrailData() (+23 more)

### Community 45 - "ei"
Cohesion: 0.11
Nodes (30): bi(), Br(), ci(), di(), Dn(), dr(), ei(), fi() (+22 more)

### Community 46 - "ie"
Cohesion: 0.24
Nodes (10): cd(), getBounds(), id(), ie(), maxPitchScaleFactor(), projectTileCoordinates(), ru(), sd() (+2 more)

### Community 47 - "dx"
Cohesion: 0.29
Nodes (7): dx(), ex(), Jb(), rx(), tx(), Xb(), Yb()

### Community 48 - "hu"
Cohesion: 0.17
Nodes (15): be(), bu(), calculateScaledKey(), fu(), g(), getProjectionData(), getProjectionDataForCustomLayer(), hu() (+7 more)

### Community 49 - "addFeature"
Cohesion: 0.20
Nodes (11): addFeature(), addFeatures(), ai(), detectSdfPatterns(), ii(), lineFeatureClips(), pp(), processPolygon() (+3 more)

### Community 50 - "Ax"
Cohesion: 0.29
Nodes (8): Ax(), eC(), Ix(), nx(), S(), tS(), x(), zx()

### Community 51 - "Vt"
Cohesion: 0.39
Nodes (8): Bt(), displayP3(), ht(), Tt(), Vt(), Xt(), Yt(), zt()

### Community 52 - "clone"
Cohesion: 0.15
Nodes (13): add(), clone(), div(), divByPoint(), matMult(), mult(), multByPoint(), perp() (+5 more)

### Community 53 - "hasDebugData"
Cohesion: 0.17
Nodes (13): _addCollisionDebugVertex(), addCollisionDebugVertices(), addDebugCollisionBoxes(), destroy(), destroyDebugData(), generateCollisionDebugBuffers(), getVertexAttributes(), hasDebugData() (+5 more)

### Community 54 - "Ee"
Cohesion: 0.17
Nodes (13): addImageSection(), _colorRampChanged(), _createColorRamp(), createNewSegment(), Ee(), getColorRampTextures(), getNextImageSectionCharCode(), getOrCreateLatestSegment() (+5 more)

### Community 55 - "parse"
Cohesion: 0.29
Nodes (8): concat(), hasPaintOverride(), ji(), kn(), parse(), pt(), ut(), wa()

### Community 56 - "cw"
Cohesion: 0.60
Nodes (5): cw(), lw(), ow(), sw(), uw()

### Community 57 - "status-actions.tsx"
Cohesion: 0.27
Nodes (9): StatusActions(), StatusBadgeFallback(), transitionLabel(), assertTransition(), canTransition(), getAvailableTransitions(), InvalidShipmentTransitionError, transitions (+1 more)

### Community 58 - "ho"
Cohesion: 0.07
Nodes (35): ao(), co(), ea(), eo(), fo(), getValueAndResolveTokens(), go(), ho() (+27 more)

### Community 59 - "setValue"
Cohesion: 0.38
Nodes (7): applyGlobalStateChange(), _propertyRootKey(), retainPriorGlobalState(), setTransition(), setValue(), setValues(), transitioned()

### Community 60 - "aC"
Cohesion: 0.12
Nodes (16): aC(), bC(), containsPolygonGeometry(), eS(), geometryType(), getGeometries(), iC(), iw() (+8 more)

### Community 61 - "dd"
Cohesion: 0.29
Nodes (7): dd(), gu(), ju(), me(), pe(), _u(), xu()

### Community 62 - "emplaceBack"
Cohesion: 0.22
Nodes (15): av(), bp(), emplaceBack(), f(), fx(), hx(), iv(), m() (+7 more)

### Community 63 - "ft"
Cohesion: 0.50
Nodes (5): checkSubtype(), error(), ft(), _parse(), r()

### Community 64 - "ud"
Cohesion: 0.22
Nodes (11): Ae(), Au(), cu(), eu(), fe(), je(), k(), meterInMercatorCoordinateUnits() (+3 more)

### Community 65 - "addLine"
Cohesion: 0.70
Nodes (5): addCurrentVertex(), addHalfVertex(), addLine(), updateDistance(), updateScaledDistance()

### Community 66 - "T"
Cohesion: 0.20
Nodes (11): cn(), fd(), gg(), isLocationOccluded(), Ku(), ln(), pd(), sn() (+3 more)

### Community 67 - "subdividePolygonInternal"
Cohesion: 0.09
Nodes (26): _ensureNoPoleVertices(), _fillPoles(), _generateInterEdgeVertices(), _generateIntraEdgeVertices(), _generatePoleQuad(), _generateSideFaces(), _getKey(), gp() (+18 more)

### Community 68 - "vl"
Cohesion: 0.67
Nodes (3): Hl(), _l(), vl()

### Community 69 - "qg"
Cohesion: 0.20
Nodes (10): addTextSection(), _appendSection(), C_(), E_(), _g(), qg(), S_(), w_() (+2 more)

### Community 70 - "fire"
Cohesion: 0.13
Nodes (16): bs(), fire(), gradientExpression(), _handleOverridablePaintPropertyUpdate(), _handleSpecialPaintPropertyUpdate(), listens(), off(), on() (+8 more)

### Community 71 - "vy"
Cohesion: 0.22
Nodes (10): b(), by(), Cy(), gy(), ly(), py(), uy(), vy() (+2 more)

### Community 72 - "_setPaintValues"
Cohesion: 0.38
Nodes (7): emplace(), getPositionIds(), getPositions(), populatePaintArray(), _setPaintValue(), _setPaintValues(), updatePaintArray()

### Community 74 - "ld"
Cohesion: 0.13
Nodes (23): ad(), C(), ce(), de(), du(), E(), ed(), fg() (+15 more)

### Community 75 - "intersects"
Cohesion: 0.28
Nodes (9): covers(), empty(), getEast(), getNorth(), getNorthWest(), getSouth(), getSouthEast(), getWest() (+1 more)

### Community 76 - "interpolate"
Cohesion: 0.15
Nodes (17): An(), _calculate(), Dt(), evaluate(), fa(), fn(), ge(), Gt() (+9 more)

### Community 77 - "Ll"
Cohesion: 0.67
Nodes (3): fy(), Ll(), Rl()

### Community 78 - "update"
Cohesion: 0.28
Nodes (9): qd(), replace(), rf(), tb(), update(), _updateDomImage(), _updateRawData(), _uploadDomImage() (+1 more)

### Community 79 - "ha"
Cohesion: 0.32
Nodes (8): Ba(), Ga(), ha(), la(), pa(), qi(), ya(), za()

### Community 81 - "_getByteView"
Cohesion: 0.29
Nodes (8): backfillBorder(), get(), _getByteView(), getPixels(), _idx(), sampleBilinear(), unpack(), _unpackAtIndex()

### Community 83 - "lngLatFromWorld"
Cohesion: 0.32
Nodes (8): _findLatitudeLimit(), _finiteInverse(), hasLngLat(), _inverse(), _inverseTowardCenter(), latitudeRange(), lngLatFromWorld(), _meridianStretch()

### Community 85 - "ca"
Cohesion: 0.33
Nodes (7): aa(), ca(), Da(), oa(), qn(), sa(), ua()

### Community 86 - "ty"
Cohesion: 0.33
Nodes (6): ay(), iy(), Nv(), ny(), ry(), ty()

### Community 88 - "mp"
Cohesion: 0.50
Nodes (5): _generateOutline(), hp(), mp(), _pointArrayToIndices(), _ringPathIndices()

### Community 89 - "ve"
Cohesion: 0.29
Nodes (7): Kc(), lu(), ol(), rd(), setUniform(), url(), ve()

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
Cohesion: 0.50
Nodes (4): Fp(), geometry(), projectLine(), projectPoint()

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

## Knowledge Gaps
- **1 isolated node(s):** `{ GET, POST }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 610 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `AdminPage()` (3× useful, score=2.991297245)
- `SupersetAnalytics()` (2× useful, score=1.994307487)
- `getLogisticsDashboard()` (2× useful, score=1.994169964)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `__` connect `__` to `n`, `dm`, `determineLineBreaks`, `P`, `createIndex`, `vf`, `ew`, `populate`, `readPackedEnd`, `writeTag`, `bx`, `l`, `de`, `overwriteGetter`, `_renderedMath`, `constructor`, `setValue`, `Bl`, `ei`, `ie`, `dx`, `hu`, `addFeature`, `Ax`, `Vt`, `clone`, `hasDebugData`, `Ee`, `parse`, `cw`, `ho`, `setValue`, `aC`, `dd`, `emplaceBack`, `ft`, `ud`, `addLine`, `T`, `subdividePolygonInternal`, `vl`, `qg`, `fire`, `vy`, `_setPaintValues`, `ld`, `intersects`, `interpolate`, `Ll`, `update`, `ha`, `recalculate`, `_getByteView`, `_down`, `lngLatFromWorld`, `ca`, `ty`, `mp`, `ve`, `paint`, `dh`, `_refreshViews`, `queryRadius`, `Ig`, `Fp`, `sortFeatures`, `_unit`, `getClusterLeaves`, `interpolationFactor`, `withinInto`, `addSymbols`, `angleWith`, `containsMaxSafeIntegerValues`, `cr`, `crossFadingFactor`, `deserializeCollisionBoxes`, `dist`, `Do`, `expandBy`, `fromLngLat`, `getGlobalStateRefs`, `hasOffscreenPass`, `Hr`, `layout`, `patchUpdatedImage`, `extend`, `once`?**
  _High betweenness centrality (0.478) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `__` (e.g. with `ao()` and `ar()`) actually correct?**
  _`__` has 34 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ GET, POST }` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10338680926916222 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `tracking.ts`, `next`, `data.ts`, `import-kaggle.ts`, `package.json`, `auth`, `mapcn-network-map.tsx`, `admin/page.tsx`, `dependencies`, `status-actions.tsx`, `types.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `constructor()` (e.g. with `n()` and `i()`) actually correct?**
  _`constructor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._