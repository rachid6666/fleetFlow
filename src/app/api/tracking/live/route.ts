import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { getLiveTrackingData } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });

  return NextResponse.json(await getLiveTrackingData(), { headers: { "Cache-Control": "no-store" } });
}