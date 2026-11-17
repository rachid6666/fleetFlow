import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";
import { respondToShipmentAssignment } from "@/lib/data";

type Context = { params: Promise<{ trackingCode: string }> };

const responseSchema = z.object({
  assignmentStatus: z.enum(["ACCEPTED", "REJECTED"]),
}).strict();

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (user.role !== "DRIVER" || !user.email) {
    return NextResponse.json({ error: "Only the assigned driver can respond" }, { status: 403 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const parsed = responseSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose accept or reject" }, { status: 400 });
  }

  const { trackingCode } = await params;
  const result = await respondToShipmentAssignment(
    trackingCode,
    parsed.data.assignmentStatus,
    user.email,
  );
  if (result.kind === "not-found") return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  if (result.kind === "forbidden") return NextResponse.json({ error: "Shipment is not assigned to this driver" }, { status: 403 });
  if (result.kind === "not-pending") return NextResponse.json({ error: "Assignment no longer needs a response" }, { status: 409 });

  return NextResponse.json({ data: result.shipment });
}
