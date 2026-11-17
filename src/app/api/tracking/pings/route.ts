import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

const pingSchema = z.object({
  trackingCode: z.string().trim().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedMph: z.number().min(0).max(120).nullable().optional(),
  headingDegrees: z.number().int().min(0).max(359).nullable().optional(),
  recordedAt: z.string().datetime().optional(),
  source: z.string().trim().min(1).max(50).default("api"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = pingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid GPS ping", details: parsed.error.flatten() }, { status: 400 });

  const shipment = await prisma.shipment.findFirst({
    where: {
      trackingCode: { equals: parsed.data.trackingCode, mode: "insensitive" },
      ...(session.user.role === "DRIVER" && session.user.email
        ? { driver: { email: { equals: session.user.email, mode: "insensitive" } } }
        : {}),
    },
    select: { id: true, trackingCode: true },
  });
  if (!shipment) return NextResponse.json({ error: "Shipment not found or not assigned to this driver" }, { status: 404 });

  const ping = await prisma.shipmentLocationPing.create({
    data: {
      shipmentId: shipment.id,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      speedMph: parsed.data.speedMph,
      headingDegrees: parsed.data.headingDegrees,
      recordedAt: parsed.data.recordedAt ? new Date(parsed.data.recordedAt) : new Date(),
      source: parsed.data.source,
    },
    select: { id: true, recordedAt: true },
  });

  return NextResponse.json({ data: { ...ping, trackingCode: shipment.trackingCode } }, { status: 201 });
}