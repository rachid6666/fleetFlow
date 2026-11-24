---
type: "query"
date: "2026-11-24T08:10:06.301093+00:00"
question: "automation workflows n8n shipment handover team activity notifications validation idempotency"
contributor: "graphify"
outcome: "useful"
source_nodes: ["emitHandoverEvent()", "processHandoverEvent()", "HandoverEvent", "TEAM_NOTIFICATION_WEBHOOK_URL"]
---

# Q: automation workflows n8n shipment handover team activity notifications validation idempotency

## Answer

Prepared slide-ready content for FleetFlow's two n8n workflows. Shipment Handover routes authorized handover events through validation and a protected FleetFlow API, where FleetFlow transactionally changes the driver, sets assignment PENDING, writes StatusLog, and stores HandoverEvent for idempotency. Team Activity normalizes START_TASK and GitHub push or pull-request events and optionally forwards them to a configured notification webhook, returning notified false when no target is configured.

## Outcome

- Signal: useful

## Source Nodes

- emitHandoverEvent()
- processHandoverEvent()
- HandoverEvent
- TEAM_NOTIFICATION_WEBHOOK_URL