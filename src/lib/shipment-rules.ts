import type { ShipmentStatus } from "./types";

const transitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ["DISPATCHED", "EXCEPTION"],
  DISPATCHED: ["IN_TRANSIT", "EXCEPTION"],
  IN_TRANSIT: ["DELIVERED", "EXCEPTION"],
  DELIVERED: [],
  EXCEPTION: ["DISPATCHED", "IN_TRANSIT"],
};

export function canTransition(from: ShipmentStatus, to: ShipmentStatus) {
  return transitions[from].includes(to);
}

export function assertTransition(from: ShipmentStatus, to: ShipmentStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid shipment transition: ${from} → ${to}`);
  }
}
