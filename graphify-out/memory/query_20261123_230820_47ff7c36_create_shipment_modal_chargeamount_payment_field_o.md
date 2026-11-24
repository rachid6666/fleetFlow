---
type: "query"
date: "2026-11-23T23:08:20.230798+00:00"
question: "create shipment modal chargeAmount payment field origin destination customer driver shipment form"
contributor: "graphify"
outcome: "corrected"
correction: "The create-shipment modal now renders the required Shipment charge USD field."
source_nodes: ["CreateShipmentButton()", "create-shipment-button.tsx", "Shipment"]
---

# Q: create shipment modal chargeAmount payment field origin destination customer driver shipment form

## Answer

Restored the missing required USD Shipment charge field in the create-shipment dialog JSX. The form already submitted chargeAmount, but the input had disappeared from the rendered grid. Admin now sees customer, optional driver, and charge. Sales sees customer and charge without driver assignment. Browser verification confirmed the charge input is visible, and the production build passed.

## Outcome

- Signal: corrected
- Correction: The create-shipment modal now renders the required Shipment charge USD field.

## Source Nodes

- CreateShipmentButton()
- create-shipment-button.tsx
- Shipment