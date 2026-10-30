import { NextResponse } from "next/server";
import { auth } from "../../auth";

export type AppRole = "ADMIN" | "DRIVER" | "CUSTOMER";

export type AccessActor = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role: AppRole;
};

export async function getAccessActor(): Promise<AccessActor | null> {
  try {
    const session = await auth();
    if (!session?.user) return null;
    const user = session.user as typeof session.user & { role?: AppRole };
    return { id: user.id, name: user.name, email: user.email, role: user.role ?? "CUSTOMER" };
  } catch {
    // Missing or invalid Auth.js configuration must fail closed, not leak a 500.
    return null;
  }
}

export function accessError(status: 401 | 403) {
  return NextResponse.json(
    { error: status === 401 ? "Authentication required" : "Forbidden" },
    { status },
  );
}

export function isAssignedTo(actor: AccessActor, driverName: string | null) {
  return actor.role === "ADMIN" || (actor.role === "DRIVER" && Boolean(actor.name && actor.name === driverName));
}
