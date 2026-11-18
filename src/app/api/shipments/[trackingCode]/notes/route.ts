import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";
import { addShipmentNote } from "@/lib/data";

type Context = { params: Promise<{ trackingCode: string }> };

const noteSchema = z
  .object({
    notes: z.string().trim().min(1).max(2_000),
    location: z.string().trim().max(200).optional(),
  })
  .strict();

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

  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Add a delivery note before saving" }, { status: 400 });
  }

  const { trackingCode } = await params;
  const result = await addShipmentNote(
    trackingCode,
    parsed.data.notes,
    parsed.data.location,
    { email: user.email, role: user.role },
  );

  if (result.kind === "not-found") {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  if (result.kind === "forbidden") {
    return NextResponse.json({ error: "Shipment is not assigned to this driver" }, { status: 403 });
  }

  return NextResponse.json({ data: result.shipment });
}
