import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { Sidebar } from "@/components/sidebar";
import { SupersetAnalytics } from "@/components/superset-analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?error=admin");
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">Operations intelligence · Apache Superset</div>
            <h1>FleetFlow analytics</h1>
            <p className="subtitle">Revenue, delivery performance, fleet costs and shipment alerts.</p>
          </div>
        </div>
        <SupersetAnalytics
          dashboardId={process.env.SUPERSET_ANALYTICS_DASHBOARD_ID}
          domain={process.env.SUPERSET_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPERSET_URL || process.env.SUPERSET_URL}
        />
      </main>
    </div>
  );
}
