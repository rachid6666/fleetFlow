import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { PageHeader } from "@/components/admin-ui";
import { Sidebar } from "@/components/sidebar";
import { SupersetAnalytics } from "@/components/superset-analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?error=admin");
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main admin-page analytics-page">
        <PageHeader
          eyebrow="Operations intelligence · Apache Superset"
          title="FleetFlow analytics"
          description="Revenue, delivery performance, fleet costs, and shipment alerts."
          account={<span aria-hidden="true">AN</span>}
        />
        <SupersetAnalytics
          dashboardId={process.env.SUPERSET_ANALYTICS_DASHBOARD_ID}
          domain={process.env.SUPERSET_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPERSET_URL || process.env.SUPERSET_URL}
        />
      </main>
    </div>
  );
}
