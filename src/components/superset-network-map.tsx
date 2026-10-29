"use client";

import { useEffect, useRef, useState } from "react";
import { WorldMap } from "@/components/world-map";

export function SupersetNetworkMap() {
  const mountPoint = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPERSET_URL && process.env.NEXT_PUBLIC_SUPERSET_DASHBOARD_ID);

  useEffect(() => {
    if (!configured || !mountPoint.current) return;
    let cancelled = false;
    async function loadDashboard() {
      try {
        const { embedDashboard } = await import("@superset-ui/embedded-sdk");
        if (cancelled || !mountPoint.current) return;
        await embedDashboard({
          id: process.env.NEXT_PUBLIC_SUPERSET_DASHBOARD_ID!,
          supersetDomain: process.env.NEXT_PUBLIC_SUPERSET_URL!,
          mountPoint: mountPoint.current,
          fetchGuestToken: async () => {
            const response = await fetch("/api/superset/guest-token");
            if (!response.ok) throw new Error("Superset guest token unavailable");
            const payload = await response.json();
            return payload.token;
          },
          dashboardUiConfig: { hideTitle: true, hideTab: true, filters: { expanded: false } },
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void loadDashboard();
    return () => { cancelled = true; };
  }, [configured]);

  if (!configured || failed) return <WorldMap />;
  return <div className="superset-map-shell"><div ref={mountPoint} className="superset-map-mount" /><div className="map-caption"><span className="online-dot" /> Live analytics map powered by Apache Superset</div></div>;
}
