import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { getShipmentByTrackingCode, transitionShipmentStatus } from "@/lib/data";
import { InvalidShipmentTransitionError } from "@/lib/shipment-rules";

type Context = { params: Promise<{ trackingCode: string }> };

const updateSchema = z
  .object({
    status: z.enum(["PENDING", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "EXCEPTION"]),
    notes: z.string().max(2_000).optional(),
  })
  .strict();

export async function GET(_: Request, { params }: Context) {
  const { trackingCode } = await params;
  const shipment = await getShipmentByTrackingCode(trackingCode);
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  return NextResponse.json({ data: shipment });
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "ADMIN" && user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Account email is required" }, { status: 403 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
  }

  const { trackingCode } = await params;
  let result: Awaited<ReturnType<typeof transitionShipmentStatus>>;
  try {
    result = await transitionShipmentStatus(
      trackingCode,
      parsed.data.status,
      parsed.data.notes,
      { email: user.email, role: user.role },
    );
  } catch (error) {
    if (error instanceof InvalidShipmentTransitionError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }

  if (result.kind === "not-found") {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  if (result.kind === "forbidden") {
    return NextResponse.json({ error: "Shipment is not assigned to this driver" }, { status: 403 });
  }

  return NextResponse.json({
    data: result.shipment,
    audit: { created: true, description: `Status changed to ${parsed.data.status}` },
  });
}
