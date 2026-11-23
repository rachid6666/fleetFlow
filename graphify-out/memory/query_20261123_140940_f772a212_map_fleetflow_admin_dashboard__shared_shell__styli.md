---
type: "query"
date: "2026-11-23T14:09:40.473363+00:00"
question: "Map FleetFlow admin dashboard, shared shell, styling, and table pages before UI redesign"
contributor: "graphify"
outcome: "useful"
source_nodes: ["AdminPage()", "Sidebar()", "SidebarNavigation()", "ShipmentsPage()", "DriversPage()", "getLogisticsDashboard()", "src_app_globals"]
---

# Q: Map FleetFlow admin dashboard, shared shell, styling, and table pages before UI redesign

## Answer

Expanded from original query via graph vocab: admin dashboard sidebar navigation globals layout shipments drivers analytics copilot chart. The graph mapped AdminPage() to Sidebar() and SidebarNavigation(), showed globals.css as shared across roles, and located dashboard data through getLogisticsDashboard(). Shipment and driver pages reuse Sidebar, status, assignment, and availability components. This supported a centralized shell and style change while keeping each route's data and actions local.

## Outcome

- Signal: useful

## Source Nodes

- AdminPage()
- Sidebar()
- SidebarNavigation()
- ShipmentsPage()
- DriversPage()
- getLogisticsDashboard()
- src_app_globals