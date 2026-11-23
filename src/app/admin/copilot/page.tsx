import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { PageHeader } from "@/components/admin-ui";
import { Sidebar } from "@/components/sidebar";
import { CopilotClient } from "@/components/copilot-client";
import { getOperationsSnapshot } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?error=admin");
  const snapshot = await getOperationsSnapshot();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main admin-page copilot-page">
        <PageHeader
          eyebrow="Operations intelligence · Grounded in FleetFlow data"
          title="AI operations copilot"
          description="Ask about live shipments, exceptions, delivery performance, fleet costs, and network capacity."
          actions={<span className="admin-only-label">CEO only</span>}
        />
        <CopilotClient snapshot={snapshot} />
      </main>
    </div>
  );
}
