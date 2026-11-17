import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";
import { assignShipmentDriver } from "@/lib/data";

type Context = { params: Promise<{ trackingCode: string }> };

const assignmentSchema = z
  .object({
    driverId: z.string().trim().min(1).nullable(),
  })
  .strict();

export async function PATCH(request: Request, { params }: Context) {
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

  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Select a valid driver" }, { status: 400 });
  }

  const { trackingCode } = await params;
  const result = await assignShipmentDriver(trackingCode, parsed.data.driverId, user.email);

  if (result.kind === "not-found") {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  if (result.kind === "invalid-driver") {
    return NextResponse.json({ error: "Select a valid driver" }, { status: 422 });
  }

  return NextResponse.json({ data: result.shipment });
}
