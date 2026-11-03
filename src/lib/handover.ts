import { randomUUID } from "node:crypto";
import { Prisma, type HandoverEventStatus } from "@prisma/client";
import { prisma } from "./prisma";

export type HandoverInput = {
  eventId: string;
  shipmentId: string;
  fromDriverId: string;
  toDriverId: string;
  occurredAt: string;
  actorEmail?: string;
};

export type HandoverResult =
  | { kind: "processed"; duplicate: false; eventId: string; shipmentId: string; status: HandoverEventStatus }
  | { kind: "duplicate"; duplicate: true; eventId: string; shipmentId: string; status: HandoverEventStatus }
  | { kind: "rejected"; duplicate: boolean; eventId: string; reason: string };

function invalid(input: HandoverInput, reason: string): Promise<HandoverResult> {
  const parsedDate = new Date(input.occurredAt);
  return prisma.handoverEvent
    .create({
      data: {
        eventId: input.eventId,
        shipmentId: input.shipmentId,
        fromDriverId: input.fromDriverId,
        toDriverId: input.toDriverId,
        occurredAt: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        status: "REJECTED",
        errorReason: reason,
      },
    })
    .then(() => ({ kind: "rejected" as const, duplicate: false, eventId: input.eventId, reason }));
}

export async function processHandoverEvent(input: HandoverInput): Promise<HandoverResult> {
  if (!input.eventId || !input.shipmentId || !input.fromDriverId || !input.toDriverId) {
    return invalid(input, "event_id, shipment_id, from_driver_id, and to_driver_id are required");
  }
  if (input.fromDriverId === input.toDriverId) {
    return invalid(input, "from_driver_id and to_driver_id must be different");
  }
  const occurredAt = new Date(input.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) return invalid(input, "timestamp must be a valid ISO-8601 date");

  const existing = await prisma.handoverEvent.findUnique({ where: { eventId: input.eventId } });
  if (existing) {
    return existing.status === "REJECTED"
      ? { kind: "rejected", duplicate: true, eventId: existing.eventId, reason: existing.errorReason ?? "Event was rejected" }
      : { kind: "duplicate", duplicate: true, eventId: existing.eventId, shipmentId: existing.shipmentId, status: existing.status };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const [shipment, fromDriver, toDriver] = await Promise.all([
        tx.shipment.findUnique({ where: { id: input.shipmentId }, select: { id: true, driverId: true, status: true } }),
        tx.user.findUnique({ where: { id: input.fromDriverId }, select: { id: true, role: true, name: true } }),
        tx.user.findUnique({ where: { id: input.toDriverId }, select: { id: true, role: true, name: true } }),
      ]);

      if (!shipment) throw new HandoverRejected("Shipment reference does not exist");
      if (!fromDriver || fromDriver.role !== "DRIVER") throw new HandoverRejected("from_driver_id must reference a driver");
      if (!toDriver || toDriver.role !== "DRIVER") throw new HandoverRejected("to_driver_id must reference a driver");
      if (shipment.driverId !== input.fromDriverId) throw new HandoverRejected("from_driver_id is not the shipment's current driver");

      await tx.shipment.update({ where: { id: shipment.id }, data: { driverId: input.toDriverId } });
      await tx.statusLog.create({
        data: {
          shipmentId: shipment.id,
          status: shipment.status,
          actorEmail: input.actorEmail,
          description: `Driver handover: ${fromDriver.name} → ${toDriver.name}`,
        },
      });
      const event = await tx.handoverEvent.create({
        data: {
          eventId: input.eventId,
          shipmentId: input.shipmentId,
          fromDriverId: input.fromDriverId,
          toDriverId: input.toDriverId,
          occurredAt,
          status: "PROCESSED",
          processedAt: new Date(),
        },
      });
      return { kind: "processed", duplicate: false, eventId: event.eventId, shipmentId: event.shipmentId, status: event.status };
    });
  } catch (error) {
    if (error instanceof HandoverRejected) return invalid(input, error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const duplicate = await prisma.handoverEvent.findUniqueOrThrow({ where: { eventId: input.eventId } });
      return { kind: "duplicate", duplicate: true, eventId: duplicate.eventId, shipmentId: duplicate.shipmentId, status: duplicate.status };
    }
    throw error;
  }
}

export async function emitHandoverEvent(event: { eventId: string; shipmentId: string; fromDriverId: string; toDriverId: string; timestamp: string }) {
  const url = process.env.FLEETFLOW_HANDOVER_WEBHOOK_URL;
  if (!url) return { sent: false as const, reason: "FLEETFLOW_HANDOVER_WEBHOOK_URL is not configured" };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...(process.env.N8N_WEBHOOK_SECRET ? { "x-fleetflow-webhook-secret": process.env.N8N_WEBHOOK_SECRET } : {}) },
      body: JSON.stringify(event),
    });
    if (!response.ok) return { sent: false as const, reason: `n8n returned HTTP ${response.status}` };
    return { sent: true as const };
  } catch (error) {
    return { sent: false as const, reason: error instanceof Error ? error.message : "n8n request failed" };
  }
}

export function newHandoverEventId() {
  return `handover_${randomUUID()}`;
}

class HandoverRejected extends Error {}
