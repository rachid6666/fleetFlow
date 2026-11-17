import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { removeDeliveryProof, saveDeliveryProof } from "@/lib/delivery-proof-storage";

type Context = { params: Promise<{ trackingCode: string }> };

const maxProofSize = 10 * 1024 * 1024;
const allowedTypes = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export async function POST(request: Request, { params }: Context) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!user.email) return NextResponse.json({ error: "Account email is required" }, { status: 403 });

  const { trackingCode } = await params;
  const shipment = await prisma.shipment.findFirst({
    where: { trackingCode: { equals: trackingCode.trim(), mode: "insensitive" } },
    select: { id: true, driver: { select: { email: true } }, assignmentStatus: true },
  });
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  if (
    user.role === "DRIVER" &&
    shipment.driver?.email.toLowerCase() !== user.email.toLowerCase()
  ) {
    return NextResponse.json({ error: "Shipment is not assigned to this driver" }, { status: 403 });
  }
  if (user.role === "DRIVER" && shipment.assignmentStatus !== "ACCEPTED") {
    return NextResponse.json({ error: "Accept the assignment before uploading proof" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload must use multipart form data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Select a PDF, JPG, or PNG file" }, { status: 400 });
  }
  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json({ error: "Only PDF, JPG, and PNG files are supported" }, { status: 415 });
  }
  if (file.size === 0 || file.size > maxProofSize) {
    return NextResponse.json({ error: "Proof must be between 1 byte and 10 MB" }, { status: 413 });
  }

  const originalName = (file.name || "delivery-proof")
    .replace(/[\\/\0-\x1f\x7f]/g, "_")
    .slice(0, 255);
  const storageKey = `${randomUUID()}.${extension}`;
  const data = Buffer.from(await file.arrayBuffer());
  if (!matchesFileSignature(file.type, data)) {
    return NextResponse.json({ error: "The file content does not match its type" }, { status: 415 });
  }

  await saveDeliveryProof(storageKey, data);
  try {
    const proof = await prisma.$transaction(async (transaction) => {
      const created = await transaction.deliveryProof.create({
        data: {
          shipmentId: shipment.id,
          storageKey,
          originalName,
          contentType: file.type,
          sizeBytes: file.size,
          uploadedBy: user.email!,
        },
        select: { id: true, originalName: true, contentType: true, sizeBytes: true, createdAt: true },
      });
      await transaction.statusLog.create({
        data: {
          shipmentId: shipment.id,
          status: "DELIVERED",
          actorEmail: user.email,
          description: `Delivery proof uploaded: ${originalName}`,
        },
      });
      return created;
    });

    return NextResponse.json({
      data: {
        ...proof,
        uploadedAt: proof.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    await removeDeliveryProof(storageKey);
    throw error;
  }
}

function matchesFileSignature(contentType: string, data: Buffer) {
  if (contentType === "application/pdf") return data.subarray(0, 5).toString() === "%PDF-";
  if (contentType === "image/jpeg") return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (contentType === "image/png") {
    return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  return false;
}
