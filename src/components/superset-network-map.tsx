"use client";

import { useEffect, useRef, useState } from "react";
import { WorldMap } from "@/components/world-map";

export function SupersetNetworkMap({
  dashboardId,
  domain,
}: {
  dashboardId?: string;
  domain?: string;
}) {
  const mountPoint = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const resolvedDashboardId = dashboardId || process.env.NEXT_PUBLIC_SUPERSET_DASHBOARD_ID;
  const resolvedDomain = domain || process.env.NEXT_PUBLIC_SUPERSET_URL;

  useEffect(() => {
    const mapDashboardId = resolvedDashboardId;
    const mapDomain = resolvedDomain;
    if (!mapDashboardId || !mapDomain || !mountPoint.current) return;
    const dashboardIdValue: string = mapDashboardId;
    const domainValue: string = mapDomain;
    let cancelled = false;
    let unmount: (() => void) | undefined;

    async function loadMapDashboard() {
      try {
        const { embedDashboard } = await import("@superset-ui/embedded-sdk");
        if (cancelled || !mountPoint.current) return;
        const dashboard = await embedDashboard({
          id: dashboardIdValue,
          supersetDomain: domainValue,
          mountPoint: mountPoint.current,
          fetchGuestToken: async () => {
            const response = await fetch("/api/superset/guest-token", { cache: "no-store" });
            if (!response.ok) throw new Error("Superset guest token unavailable");
            const payload = await response.json() as { token?: string };
            if (!payload.token) throw new Error("Superset guest token missing");
            return payload.token;
          },
          dashboardUiConfig: {
            hideTitle: true,
            hideTab: true,
            hideChartControls: true,
            filters: { visible: false, expanded: false },
            urlParams: { show_filters: "0", expand_filters: "0" },
          },
        });
        dashboard.setThemeMode("default");
        await dashboard.setThemeConfig({
          algorithm: "default",
          token: {
            colorPrimary: "#25895C",
            colorBgBase: "#F1F4EF",
            colorBgContainer: "#FFFFFF",
            colorTextBase: "#17231E",
            colorBorder: "#DCE4DE",
            borderRadius: 12,
          },
        });
        if (cancelled) dashboard.unmount();
        else unmount = () => dashboard.unmount();
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void loadMapDashboard();
    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [resolvedDashboardId, resolvedDomain]);

  if (!resolvedDashboardId || !resolvedDomain || failed) return <WorldMap />;
  return (
    <div className="superset-map-shell">
      <div ref={mountPoint} className="superset-map-mount" />
      <div className="map-caption"><span className="online-dot" /> Analytics map powered by Apache Superset</div>
    </div>
  );
}
