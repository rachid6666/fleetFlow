"use client";

import { useEffect, useMemo, useState } from "react";
import { statusLabels, type LiveShipment, type LiveTrackingData } from "@/lib/types";

const colors = {
  "on-track": "#1e9b76",
  stale: "#f2994a",
  exception: "#d95f59",
  completed: "#4e86c4",
};

function project(point: { latitude: number; longitude: number }) {
  const x = ((point.longitude + 126) / 61) * 900 + 50;
  const y = ((50.5 - point.latitude) / 27) * 410 + 45;
  return { x, y };
}

function routePoints(shipment: LiveShipment) {
  return shipment.trail.map((point) => {
    const projected = project(point);
    return `${projected.x},${projected.y}`;
  }).join(" ");
}

export function LiveTrackingMap({ initialData }: { initialData: LiveTrackingData }) {
  const [data, setData] = useState(initialData);
  const [selectedCode, setSelectedCode] = useState(initialData.shipments[0]?.trackingCode ?? "");
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
          setPollError(false);
          setSelectedCode((current) => current || next.shipments[0]?.trackingCode || "");
        }
      } catch {
        if (active) setPollError(true);
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

  return (
    <section className="panel live-tracking-panel">
      <div className="panel-heading live-tracking-heading">
        <div>
          <div className="eyebrow">Live fleet telemetry · updates every 10 seconds</div>
          <h2>Shipment GPS map</h2>
          <p className="subtitle">Synthetic routes demonstrate the production tracking flow using real shipment records and stored GPS pings.</p>
        </div>
        <span className={`telemetry-status${pollError ? " is-error" : ""}`}>
          <span className="online-dot" /> {pollError ? "Reconnecting" : "Telemetry online"}
        </span>
      </div>

      <div className="tracking-kpis">
        <div><strong>{data.summary.inTransit}</strong><span>In transit</span></div>
        <div><strong>{data.summary.exceptions}</strong><span>Exceptions</span></div>
        <div><strong>{data.summary.stale}</strong><span>Stale feeds</span></div>
        <div><strong>{data.summary.delivered}</strong><span>Delivered</span></div>
      </div>

      {data.shipments.length ? (
        <div className="tracking-layout">
          <div className="fleet-map-shell">
            <svg className="fleet-map" viewBox="0 0 1000 520" role="img" aria-label="Live shipment locations across the United States">
              <defs>
                <pattern id="live-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e3eeea" strokeWidth="1" />
                </pattern>
                <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f3d3a" floodOpacity=".24" />
                </filter>
              </defs>
              <rect width="1000" height="520" rx="16" fill="#f5faf8" />
              <rect width="1000" height="520" rx="16" fill="url(#live-grid)" />
              <path d="M91 190 L127 127 L190 103 L244 116 L296 76 L356 84 L414 58 L476 79 L521 58 L589 78 L648 66 L711 89 L775 80 L844 112 L900 151 L934 198 L914 244 L946 286 L904 325 L842 338 L801 375 L735 370 L688 409 L621 396 L575 425 L515 402 L456 423 L397 390 L339 397 L288 365 L232 370 L185 335 L128 326 L90 278 L62 237 Z" fill="#e6f2ee" stroke="#b9d5cc" strokeWidth="2" />
              <path d="M90 278 L128 326 L185 335 L232 370 L288 365 L339 397 L397 390 L456 423 L515 402 L575 425 L621 396 L688 409 L735 370 L801 375 L842 338" fill="none" stroke="#c7dfd7" strokeWidth="2" strokeDasharray="5 7" />
              {data.shipments.map((shipment) => {
                const color = colors[shipment.attention];
                return <polyline key={`${shipment.id}-trail`} points={routePoints(shipment)} fill="none" stroke={color} strokeWidth={selected?.id === shipment.id ? 5 : 3} strokeLinecap="round" strokeLinejoin="round" opacity={selected?.id === shipment.id ? 1 : 0.55} />;
              })}
              {data.shipments.map((shipment) => {
                const point = project(shipment.latestPoint);
                const color = colors[shipment.attention];
                const isSelected = selected?.id === shipment.id;
                return (
                  <g key={shipment.id} className="map-shipment" onClick={() => setSelectedCode(shipment.trackingCode)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCode(shipment.trackingCode); } }} role="button" tabIndex={0} aria-label={`Select ${shipment.trackingCode}`}>
                    {isSelected ? <circle cx={point.x} cy={point.y} r="18" fill={color} opacity=".16" /> : null}
                    <circle cx={point.x} cy={point.y} r={isSelected ? 9 : 7} fill={color} stroke="white" strokeWidth="3" filter="url(#pin-shadow)" />
                    <rect x={point.x + 12} y={point.y - 20} width="94" height="24" rx="6" fill="white" stroke="#d5e4df" />
                    <text x={point.x + 19} y={point.y - 4} fill="#113b38" fontSize="11" fontWeight="700">{shipment.trackingCode}</text>
                  </g>
                );
              })}
            </svg>
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
        <p className="subtitle">No GPS pings are stored yet. Run <code>npm run db:seed:tracking</code> to add synthetic live routes.</p>
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