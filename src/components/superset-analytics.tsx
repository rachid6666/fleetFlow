"use client";

import { useEffect, useRef, useState } from "react";

export function SupersetAnalytics({ dashboardId, domain, compact = false }: { dashboardId?: string; domain?: string; compact?: boolean }) {
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
          id: dashboardId,
          supersetDomain: domain,
          mountPoint: mount.current,
          dashboardUiConfig: {
            hideTitle: true,
            hideChartControls: true,
            filters: { visible: false, expanded: false },
            urlParams: { show_filters: "0", expand_filters: "0" },
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
            colorPrimary: "#25895C",
            colorBgBase: "#F1F4EF",
            colorBgContainer: "#FFFFFF",
            colorTextBase: "#17231E",
            colorBorder: "#DCE4DE",
            borderRadius: 14,
          },
        });
        if (cancelled) dashboard.unmount();
        else {
          unmount = () => dashboard.unmount();
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [dashboardId, domain, attempt]);

  if (!dashboardId || !domain) {
    return (
      <section className={compact ? "analytics-state is-compact" : "panel analytics-state"} role="status">
        <div className="eyebrow">Configuration required</div>
        <h2>Analytics is not configured</h2>
        <p>Follow docs/analytics.md to start the FleetFlow dashboard.</p>
      </section>
    );
  }

  return (
    <section className={compact ? "analytics-panel is-overview" : "panel analytics-panel"} aria-busy={loading}>
      {loading ? (
        <div className="analytics-state" role="status">
          <div className="eyebrow">Apache Superset</div>
          <h2>Loading operations dashboard…</h2>
          <p>FleetFlow is connecting to the embedded analytics workspace.</p>
        </div>
      ) : null}
      {error ? (
        <div className="analytics-state is-error" role="alert">
          <div className="eyebrow">Connection issue</div>
          <h2>Analytics is temporarily unavailable</h2>
          <p>Check that Superset is running, then try again.</p>
          <button className="button" type="button" onClick={() => setAttempt((current) => current + 1)}>
            Retry dashboard
          </button>
        </div>
      ) : null}
      <div ref={mount} className="analytics-mount" hidden={error} />
    </section>
  );
}
