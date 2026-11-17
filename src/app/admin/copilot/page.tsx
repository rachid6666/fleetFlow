import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
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
      <main className="main copilot-page">
        <div className="topbar">
          <div>
            <div className="eyebrow">Operations intelligence · grounded in FleetFlow data</div>
            <h1>AI operations copilot</h1>
            <p className="subtitle">Ask about live shipments, exceptions, delivery performance, fleet costs, and network capacity.</p>
          </div>
          <span className="status-badge status-delivered">Admin only</span>
        </div>
        <CopilotClient snapshot={snapshot} />
      </main>
    </div>
  );
}