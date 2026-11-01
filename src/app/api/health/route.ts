import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ service: "fleetflow", status: "ok", database: "ok" });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      { service: "fleetflow", status: "error", database: "unavailable" },
      { status: 503 },
    );
  }
}
