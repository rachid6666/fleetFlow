---
type: "query"
date: "2026-11-23T14:18:16.251023+00:00"
question: "Add a Superset dashboard view to the FleetFlow admin overview"
contributor: "graphify"
outcome: "useful"
source_nodes: ["AdminPage()", "AnalyticsPage()", "SupersetAnalytics()", "guest-token/route.ts", "PageHeader()"]
---

# Q: Add a Superset dashboard view to the FleetFlow admin overview

## Answer

Expanded from original query via graph vocab: admin dashboard analytics superset chart metric page layout guest token env. The existing AnalyticsPage() already passes the configured dashboard ID and Superset domain into SupersetAnalytics(). The guest-token route keeps ADMIN authorization and requests the analytics dashboard. The implementation reuses that component with a compact overview variant rather than creating a second embed or changing the API.

## Outcome

- Signal: useful

## Source Nodes

- AdminPage()
- AnalyticsPage()
- SupersetAnalytics()
- guest-token/route.ts
- PageHeader()