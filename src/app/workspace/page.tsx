import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { workspacePathForRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(workspacePathForRole(session.user.role));
}
