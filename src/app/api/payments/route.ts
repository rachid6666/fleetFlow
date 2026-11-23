import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../auth";
import { recordShipmentPayment } from "@/lib/data";

const paymentSchema = z
  .object({
    shipmentId: z.string().trim().min(1),
    amount: z.number().finite().positive().max(100_000_000),
    method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]),
    reference: z.string().trim().max(200).optional(),
  })
  .strict();

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

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payment details" },
      { status: 400 },
    );
  }

  const result = await recordShipmentPayment({
    ...parsed.data,
    actorEmail: user.email,
  });

  if (result.kind === "not-found") {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  if (result.kind === "invalid") {
    return NextResponse.json({ error: result.message }, { status: 422 });
  }

  return NextResponse.json({ data: result.payment }, { status: 201 });
}
