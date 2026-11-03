import { NextResponse } from "next/server";
import { z } from "zod";
import { processHandoverEvent } from "@/lib/handover";

const eventSchema = z.object({
  event_id: z.string().min(1),
  shipment_id: z.string().min(1),
  from_driver_id: z.string().min(1),
  to_driver_id: z.string().min(1),
  timestamp: z.string().datetime(),
}).strict();

export async function POST(request: Request) {
  const expected = process.env.N8N_WEBHOOK_SECRET;
  if (!expected || request.headers.get("x-fleetflow-webhook-secret") !== expected) {
    return NextResponse.json({ error: "Invalid integration credential" }, { status: 401 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid handover event", details: parsed.error.flatten() }, { status: 400 });

  const result = await processHandoverEvent({
    eventId: parsed.data.event_id,
    shipmentId: parsed.data.shipment_id,
    fromDriverId: parsed.data.from_driver_id,
    toDriverId: parsed.data.to_driver_id,
    occurredAt: parsed.data.timestamp,
    actorEmail: "n8n:handover-workflow",
  });
  if (result.kind === "rejected") return NextResponse.json({ error: result.reason, event_id: result.eventId, visible: true }, { status: 422 });
  return NextResponse.json({ data: result, idempotent: result.duplicate, visible: true }, { status: 200 });
}
