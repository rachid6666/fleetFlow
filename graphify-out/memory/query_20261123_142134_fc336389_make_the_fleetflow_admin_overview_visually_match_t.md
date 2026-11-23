---
type: "query"
date: "2026-11-23T14:21:34.727788+00:00"
question: "Make the FleetFlow admin overview visually match the supplied dashboard reference with Superset, fleet metrics, a data table, and a map"
contributor: "graphify"
outcome: "useful"
source_nodes: ["AdminPage()", "SupersetAnalytics()", "getLogisticsDashboard()", "LiveTrackingMap()", "PanelHeading()"]
---

# Q: Make the FleetFlow admin overview visually match the supplied dashboard reference with Superset, fleet metrics, a data table, and a map

## Answer

Expanded from original query via graph vocab: admin dashboard analytics superset chart metric page layout guest token env. AdminPage() owns the overview composition, SupersetAnalytics() owns the authenticated embed, getLogisticsDashboard() supplies real KPI and table data, and LiveTrackingMap() supplies stored GPS routes. The overview was reorganized into a three-card KPI row, a Superset analytics panel, a green fleet-readiness summary, a latest-loads table, and a compact live map.

## Outcome

- Signal: useful

## Source Nodes

- AdminPage()
- SupersetAnalytics()
- getLogisticsDashboard()
- LiveTrackingMap()
- PanelHeading()