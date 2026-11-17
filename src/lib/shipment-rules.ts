import type { ShipmentStatus } from "./types";

const transitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ["DISPATCHED", "EXCEPTION"],
  DISPATCHED: ["IN_TRANSIT", "EXCEPTION"],
  IN_TRANSIT: ["DELIVERED", "EXCEPTION"],
  DELIVERED: [],
  EXCEPTION: ["DISPATCHED", "IN_TRANSIT"],
};

export function getAvailableTransitions(from: ShipmentStatus) {
  return transitions[from];
}

export function canTransition(from: ShipmentStatus, to: ShipmentStatus) {
  return getAvailableTransitions(from).includes(to);
}

export function assertTransition(from: ShipmentStatus, to: ShipmentStatus) {
  if (!canTransition(from, to)) {
    throw new InvalidShipmentTransitionError(from, to);
  }
}

export class InvalidShipmentTransitionError extends Error {
  constructor(from: ShipmentStatus, to: ShipmentStatus) {
    super(`Invalid shipment transition: ${from} → ${to}`);
    this.name = "InvalidShipmentTransitionError";
  }
}
