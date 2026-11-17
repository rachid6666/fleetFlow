import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { readDeliveryProof } from "@/lib/delivery-proof-storage";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ trackingCode: string; proofId: string }> };

export async function GET(_: Request, { params }: Context) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!user.email) return NextResponse.json({ error: "Account email is required" }, { status: 403 });

  const { trackingCode, proofId } = await params;
  const proof = await prisma.deliveryProof.findFirst({
    where: {
      id: proofId,
      shipment: { trackingCode: { equals: trackingCode.trim(), mode: "insensitive" } },
    },
    select: {
      storageKey: true,
      originalName: true,
      contentType: true,
      shipment: { select: { driver: { select: { email: true } }, assignmentStatus: true } },
    },
  });
  if (!proof) return NextResponse.json({ error: "Delivery proof not found" }, { status: 404 });
  if (
    user.role === "DRIVER" &&
    (proof.shipment.driver?.email.toLowerCase() !== user.email.toLowerCase() ||
      proof.shipment.assignmentStatus !== "ACCEPTED")
  ) {
    return NextResponse.json({ error: "Delivery proof is not available" }, { status: 403 });
  }

  let data: Buffer;
  try {
    data = await readDeliveryProof(proof.storageKey);
  } catch {
    return NextResponse.json({ error: "Delivery proof file is unavailable" }, { status: 410 });
  }

  const body = new ArrayBuffer(data.byteLength);
  new Uint8Array(body).set(data);

  return new Response(body, {
    headers: {
      "content-type": proof.contentType,
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(proof.originalName)}`,
      "cache-control": "private, no-store",
    },
  });
}
