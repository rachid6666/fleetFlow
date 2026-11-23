---
type: "query"
date: "2026-11-23T19:11:58.422661+00:00"
question: "create shipment live map tracking pings location status shipment form payment billing invoice financial route"
contributor: "graphify"
outcome: "useful"
source_nodes: ["getLiveTrackingData()", "createShipment", "ShipmentPayment", "PaymentsPage()", "RecordPaymentButton()"]
---

# Q: create shipment live map tracking pings location status shipment form payment billing invoice financial route

## Answer

Fixed shipment creation to write an initial GPS point, updated live tracking to include facility-based shipments without telemetry at their origin or destination, and added a protected USD payment ledger with shipment charges, partial and paid balances, an admin payments page, and a POST payments API.

## Outcome

- Signal: useful

## Source Nodes

- getLiveTrackingData()
- createShipment
- ShipmentPayment
- PaymentsPage()
- RecordPaymentButton()