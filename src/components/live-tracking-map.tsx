"use client";

import { useEffect, useMemo, useState } from "react";
import { MapcnLiveFleetMap } from "@/components/mapcn-live-fleet-map";
import { statusLabels, type LiveTrackingData } from "@/lib/types";

const colors = {
  "on-track": "#25895c",
  stale: "#d78734",
  exception: "#c2544f",
  completed: "#4679a8",
};

export function LiveTrackingMap({
  initialData,
  initialAvailable = true,
  compact = false,
}: {
  initialData: LiveTrackingData;
  initialAvailable?: boolean;
  compact?: boolean;
}) {
  const [data, setData] = useState(initialData);
  const [selectedCode, setSelectedCode] = useState(initialData.shipments[0]?.trackingCode ?? "");
  const [dataAvailable, setDataAvailable] = useState(initialAvailable);
  const [pollError, setPollError] = useState(false);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch("/api/tracking/live", { cache: "no-store" });
        if (!response.ok) throw new Error("Live tracking unavailable");
        const next = (await response.json()) as LiveTrackingData;
        if (active) {
          setData(next);
          setDataAvailable(true);
          setPollError(false);
          setSelectedCode((current) => current || next.shipments[0]?.trackingCode || "");
        }
      } catch {
        if (active) {
          setPollError(true);
        }
      }
    };
    const timer = window.setInterval(poll, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const selected = useMemo(
    () => data.shipments.find((shipment) => shipment.trackingCode === selectedCode) ?? data.shipments[0],
    [data.shipments, selectedCode],
  );
  const telemetryOnline = dataAvailable && !pollError;

  return (
    <section className={`panel live-tracking-panel${compact ? " is-overview" : ""}`}>
      <div className="panel-heading live-tracking-heading">
        <div>
          <div className="eyebrow">Live fleet telemetry · updates every 10 seconds</div>
          <h2>{compact ? "Live fleet map" : "Shipment GPS map"}</h2>
          <p className="subtitle">{compact ? "Stored GPS routes on real shipment records." : "Synthetic routes demonstrate the production tracking flow using real shipment records and stored GPS pings."}</p>
        </div>
        <span className={`telemetry-status${telemetryOnline ? "" : " is-error"}`} role="status" aria-live="polite">
          <span className="online-dot" />{" "}
          {telemetryOnline ? "Telemetry online" : dataAvailable ? "Reconnecting" : "Telemetry unavailable"}
        </span>
      </div>

      <div className="tracking-kpis">
        <div><strong>{dataAvailable ? data.summary.inTransit : "—"}</strong><span>In transit</span></div>
        <div><strong>{dataAvailable ? data.summary.exceptions : "—"}</strong><span>Exceptions</span></div>
        <div><strong>{dataAvailable ? data.summary.stale : "—"}</strong><span>Stale feeds</span></div>
        <div><strong>{dataAvailable ? data.summary.delivered : "—"}</strong><span>Delivered</span></div>
      </div>

      {data.shipments.length ? (
        <div className="tracking-layout">
          <div className="fleet-map-shell">
            <MapcnLiveFleetMap
              shipments={data.shipments}
              selectedCode={selected?.trackingCode ?? ""}
              onSelect={setSelectedCode}
            />
            <div className="fleet-map-legend">
              <span><i style={{ background: colors["on-track"] }} /> On track</span>
              <span><i style={{ background: colors.stale }} /> Stale</span>
              <span><i style={{ background: colors.exception }} /> Exception</span>
              <span><i style={{ background: colors.completed }} /> Delivered</span>
            </div>
          </div>

          <aside className="tracking-list" aria-label="Tracked shipments">
            {data.shipments.map((shipment) => (
              <button type="button" key={shipment.id} className={`tracking-list-item${selected?.id === shipment.id ? " is-selected" : ""}`} onClick={() => setSelectedCode(shipment.trackingCode)}>
                <span className={`tracking-indicator tracking-${shipment.attention}`} />
                <span className="tracking-list-copy">
                  <strong>{shipment.trackingCode}</strong>
                  <small>{shipment.origin} → {shipment.destination}</small>
                </span>
                <span className="tracking-list-meta">
                  <span>{shipment.progressPercent}%</span>
                  <small>{shipment.minutesSincePing}m ago</small>
                </span>
              </button>
            ))}
          </aside>
        </div>
      ) : (
        <p className="subtitle">
          {dataAvailable
            ? <>No GPS pings are stored yet. Run <code>npm run db:seed:tracking</code> to add synthetic live routes.</>
            : "Live GPS telemetry could not be loaded. FleetFlow will retry automatically."}
        </p>
      )}

      {selected ? (
        <div className="tracking-selection">
          <div>
            <div className="eyebrow">Selected shipment</div>
            <h3>{selected.trackingCode} · {statusLabels[selected.status]}</h3>
            <p>{selected.origin} → {selected.destination} · {selected.driverName ?? "Unassigned driver"}</p>
          </div>
          <div className="tracking-selection-stats">
            <span><strong>{selected.progressPercent}%</strong> route progress</span>
            <span><strong>{selected.remainingMiles}</strong> miles remaining</span>
            <span><strong>{selected.latestPoint.speedMph ?? 0}</strong> mph</span>
            <span><strong>{selected.eta}</strong> ETA</span>
          </div>
          <div className="progress-track" aria-label={`${selected.progressPercent}% complete`}><span style={{ width: `${selected.progressPercent}%`, background: colors[selected.attention] }} /></div>
        </div>
      ) : null}
    </section>
  );
}
