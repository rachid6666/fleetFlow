---
type: "query"
date: "2026-11-23T20:21:10.316202+00:00"
question: "n8n workflow shipment handover team activity webhook secret fleetflow api integration active"
contributor: "graphify"
outcome: "useful"
source_nodes: ["emitHandoverEvent()", "processHandoverEvent()", "integrations/handover/route.ts", "N8N_WEBHOOK_SECRET", "FLEETFLOW_API_URL"]
---

# Q: n8n workflow shipment handover team activity webhook secret fleetflow api integration active

## Answer

Verified both FleetFlow workflows are active in the running n8n instance. Corrected host-run networking so n8n calls FleetFlow through host.docker.internal:3000 and FleetFlow calls n8n through localhost:5678. Confirmed matching shared secrets. Team Activity returned 200 with notifications skipped because no notification URL is configured. A real temporary handover completed through FleetFlow, n8n, and the protected integration endpoint, changed the driver, processed once, returned idempotent success on replay, and cleaned up its test data.

## Outcome

- Signal: useful

## Source Nodes

- emitHandoverEvent()
- processHandoverEvent()
- integrations/handover/route.ts
- N8N_WEBHOOK_SECRET
- FLEETFLOW_API_URL