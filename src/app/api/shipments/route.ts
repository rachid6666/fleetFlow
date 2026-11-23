import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../auth";
import { createShipment, listShipments, listShipmentsForCustomer, listShipmentsForDriver } from "@/lib/data";

const createShipmentSchema = z
  .object({
    originFacilityId: z.string().trim().min(1),
    destinationFacilityId: z.string().trim().min(1),
    customerId: z.string().trim().min(1),
    driverId: z.string().trim().min(1).nullable().optional(),
    notes: z.string().trim().max(2_000).optional(),
  })
  .strict()
  .refine((input) => input.originFacilityId !== input.destinationFacilityId, {
    message: "Origin and destination must be different storage locations",
  });

export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (user.role === "DRIVER" || user.role === "CUSTOMER") {
    if (!user.email) {
      return NextResponse.json({ error: "Account email is required" }, { status: 403 });
    }
    const data = user.role === "DRIVER"
      ? await listShipmentsForDriver(user.email)
      : await listShipmentsForCustomer(user.email);
    return NextResponse.json({ data, count: data.length });
  }
  const data = await listShipments();
  return NextResponse.json({ data, count: data.length });
}

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
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

  const parsed = createShipmentSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid shipment details" },
      { status: 400 },
    );
  }

  const result = await createShipment({
    ...parsed.data,
    driverId: parsed.data.driverId ?? null,
    actorEmail: user.email,
  });

  if (result.kind === "invalid") {
    return NextResponse.json({ error: result.message }, { status: 422 });
  }

  return NextResponse.json({ data: result.shipment }, { status: 201 });
}
