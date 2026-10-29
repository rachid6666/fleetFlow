# FleetFlow schema reference

The canonical schema is [`prisma/schema.prisma`](../../../prisma/schema.prisma). Keep this reference aligned with it.

## Core models

- `User`: identity, role, driver assignments, and customer ownership.
- `Shipment`: route, tracking code, current status, optional driver, required customer, and notes.
- `StatusLog`: append-only timeline event linked to a shipment.

## Status transition guidance

The initial graph is intentionally conservative:

```text
PENDING -> DISPATCHED -> IN_TRANSIT -> DELIVERED
   |            |             |
   +----------> EXCEPTION <---+
```

The exact recovery path from `EXCEPTION` should be decided by product policy before enabling it. Do not silently permit arbitrary enum changes just because the database accepts the value.

## Transaction shape

```ts
await prisma.$transaction(async (tx) => {
  const shipment = await tx.shipment.update({
    where: { id: shipmentId },
    data: { status: nextStatus },
  });

  await tx.statusLog.create({
    data: {
      shipmentId: shipment.id,
      status: nextStatus,
      location,
      description,
    },
  });

  return shipment;
});
```

In production code, perform authorization and transition validation before the update, and include actor metadata in the audit model when the product requires a stronger audit trail.
