import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { listShipments, listShipmentsForDriver } from "@/lib/data";

export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "ADMIN" && user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "DRIVER") {
    if (!user.email) {
      return NextResponse.json({ error: "Account email is required" }, { status: 403 });
    }
    const data = await listShipmentsForDriver(user.email);
    return NextResponse.json({ data, count: data.length });
  }

  const data = await listShipments();
  return NextResponse.json({ data, count: data.length });
}
