import { NextResponse } from "next/server";
import { getShipmentByTrackingCode, updateDemoShipmentStatus } from "@/lib/data";
import { assertTransition } from "@/lib/shipment-rules";
import type { ShipmentStatus } from "@/lib/types";

type Context = { params: Promise<{ trackingCode: string }> };

export async function GET(_: Request, { params }: Context) {
  const { trackingCode } = await params;
  const shipment = getShipmentByTrackingCode(trackingCode);
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  return NextResponse.json({ data: shipment });
}

export async function PATCH(request: Request, { params }: Context) {
  const { trackingCode } = await params;
  const shipment = getShipmentByTrackingCode(trackingCode);
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });

  const body = (await request.json()) as { status?: ShipmentStatus; notes?: string };
  if (!body.status) return NextResponse.json({ error: "status is required" }, { status: 400 });

  try {
    assertTransition(shipment.status, body.status);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid transition" }, { status: 422 });
  }

  const updated = updateDemoShipmentStatus(trackingCode, body.status, body.notes);
  return NextResponse.json({ data: updated, audit: { created: true, description: `Status changed to ${body.status}` } });
}
