import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccessActor } from "@/lib/access";
import { emitHandoverEvent, newHandoverEventId, processHandoverEvent } from "@/lib/handover";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ trackingCode: string }> };

const inputSchema = z.object({ to_driver_id: z.string().min(1), timestamp: z.string().datetime().optional() }).strict();

export async function POST(request: Request, { params }: Context) {
  const actor = await getAccessActor();
  if (!actor) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (actor.role !== "ADMIN" && actor.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!actor.id) return NextResponse.json({ error: "Authenticated user id is required" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "to_driver_id and an optional ISO timestamp are required" }, { status: 400 });

  const { trackingCode } = await params;
  const shipment = await prisma.shipment.findFirst({ where: { trackingCode: { equals: trackingCode.trim(), mode: "insensitive" } }, select: { id: true, driverId: true } });
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  if (actor.role === "DRIVER" && shipment.driverId !== actor.id) return NextResponse.json({ error: "Shipment is not assigned to this driver" }, { status: 403 });
  if (!shipment.driverId) return NextResponse.json({ error: "Shipment has no current driver" }, { status: 422 });

  const event = { eventId: newHandoverEventId(), shipmentId: shipment.id, fromDriverId: shipment.driverId, toDriverId: parsed.data.to_driver_id, timestamp: parsed.data.timestamp ?? new Date().toISOString() };
  const result = await processHandoverEvent({ ...event, occurredAt: event.timestamp, actorEmail: actor.email ?? undefined });
  if (result.kind === "rejected") return NextResponse.json({ error: result.reason, event_id: result.eventId }, { status: 422 });

  const notification = result.kind === "processed" ? await emitHandoverEvent(event) : { sent: false as const, reason: "duplicate event" };
  return NextResponse.json({ data: result, event, n8n: notification }, { status: 200 });
}
