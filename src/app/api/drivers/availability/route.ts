import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { updateDriverAvailability, updateDriverAvailabilityByEmail } from "@/lib/data";

const availabilitySchema = z.object({
  driverId: z.string().trim().min(1).optional(),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
}).strict();

export async function PATCH(request: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Select a valid availability setting" }, { status: 400 });
  }

  if (user.role === "ADMIN" && !parsed.data.driverId) {
    return NextResponse.json({ error: "Driver is required" }, { status: 400 });
  }
  if (user.role === "DRIVER" && !user.email) {
    return NextResponse.json({ error: "Account email is required" }, { status: 403 });
  }

  const driver = user.role === "ADMIN"
    ? await updateDriverAvailability(parsed.data.driverId!, parsed.data.availability)
    : await updateDriverAvailabilityByEmail(user.email!, parsed.data.availability);

  if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  return NextResponse.json({ data: driver });
}
