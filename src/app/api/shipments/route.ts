import { NextResponse } from "next/server";
import { demoShipments } from "@/lib/data";
import { accessError, getAccessActor } from "@/lib/access";

export async function GET() {
  const actor = await getAccessActor();
  if (!actor) return accessError(401);
  if (actor.role !== "ADMIN" && actor.role !== "DRIVER") return accessError(403);
  const data = actor.role === "ADMIN"
    ? demoShipments
    : demoShipments.filter((shipment) => shipment.driverName === actor.name);
  return NextResponse.json({ data, count: data.length });
}
