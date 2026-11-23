---
type: "query"
date: "2026-11-23T17:52:45.044850+00:00"
question: "db seed tracking synthetic live routes shipment GPS facilities drivers live map"
contributor: "graphify"
outcome: "useful"
source_nodes: ["getLiveTrackingData()", "Shipment", "ShipmentLocationPing", "package.json"]
---

# Q: db seed tracking synthetic live routes shipment GPS facilities drivers live map

## Answer

Restored db:seed:tracking with seven stable FF-LIVE shipments, endpoint coordinates from Neon facilities, identities from the synced Authentik directory, and 118 synthetic GPS pings. The script updates only its fixed synthetic tracking codes and synthetic ping source, so rerunning it remains idempotent.

## Outcome

- Signal: useful

## Source Nodes

- getLiveTrackingData()
- Shipment
- ShipmentLocationPing
- package.json