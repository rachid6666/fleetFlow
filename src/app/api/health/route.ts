import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ service: "fleetflow", status: "ok", database: "demo-store" });
}
