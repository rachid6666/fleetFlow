import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { getShipmentFormOptions } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "CEO access required" }, { status: 403 });
  }

  try {
    return NextResponse.json(await getShipmentFormOptions(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Shipment form options are temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
