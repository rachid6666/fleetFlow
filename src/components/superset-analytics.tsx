"use client";

import { useEffect, useRef, useState } from "react";

export function SupersetAnalytics({ dashboardId, domain }: { dashboardId?: string; domain?: string }) {
  const mount = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!dashboardId || !domain || !mount.current) return;
    let cancelled = false;
    let unmount: (() => void) | undefined;
    setLoading(true);
    setError(false);
    void (async () => {
      try {
        const { embedDashboard } = await import("@superset-ui/embedded-sdk");
        if (cancelled || !mount.current) return;
        const dashboard = await embedDashboard({
          id: dashboardId, supersetDomain: domain, mountPoint: mount.current,
          dashboardUiConfig: {
            hideTitle: true,
            hideChartControls: true,
            filters: { visible: false, expanded: false },
            urlParams: { show_filters: '0', expand_filters: '0' },
          },
          fetchGuestToken: async () => {
            const response = await fetch("/api/superset/guest-token?dashboard=analytics", { cache: "no-store" });
            if (!response.ok) throw new Error("Dashboard unavailable");
            const data = await response.json() as { token?: string };
            if (!data.token) throw new Error("Missing token");
            return data.token;
          },
        });
        dashboard.setThemeMode("default");
        await dashboard.setThemeConfig({
          algorithm: "default",
          token: {
            colorPrimary: "#0F766E",
            colorBgBase: "#F5F8F7",
            colorBgContainer: "#FFFFFF",
            colorTextBase: "#102A2A",
            colorBorder: "#D8E4E1",
            borderRadius: 10,
          },
        });
        if (cancelled) dashboard.unmount();
        else { unmount = () => dashboard.unmount(); setLoading(false); }
      } catch { if (!cancelled) { setError(true); setLoading(false); } }
    })();
    return () => { cancelled = true; unmount?.(); };
  }, [dashboardId, domain, attempt]);

  if (!dashboardId || !domain) return <section className="panel"><h2>Analytics is not configured</h2><p>Follow docs/analytics.md to start the FleetFlow dashboard.</p></section>;
  return <section className="panel analytics-panel">
    {loading && <p role="status">Loading operations dashboard…</p>}
    {error && <div role="alert"><h2>Analytics is temporarily unavailable</h2><p>Check that Superset is running, then try again.</p><button type="button" onClick={() => setAttempt(n => n + 1)}>Retry dashboard</button></div>}
    <div ref={mount} className="analytics-mount" hidden={error} />
  </section>;
}
