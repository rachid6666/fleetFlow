import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { workspacePathForRole } from "@/lib/roles";

export default async function SalesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SALES") redirect(workspacePathForRole(session.user.role));
  return children;
}
