import { NextResponse } from "next/server";
import { demoShipments } from "@/lib/data";

export function GET() {
  return NextResponse.json({ data: demoShipments, count: demoShipments.length });
}
