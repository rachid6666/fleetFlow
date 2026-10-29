"use client";

import { useState } from "react";
import { statusLabels, type ShipmentStatus } from "@/lib/types";
import { canTransition } from "@/lib/shipment-rules";

export function StatusActions({ trackingCode, current }: { trackingCode: string; current: ShipmentStatus }) {
  const [status, setStatus] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next: ShipmentStatus | null = (["DISPATCHED", "IN_TRANSIT"] as ShipmentStatus[]).find((candidate) => canTransition(status, candidate)) ?? null;
  if (!next) return <StatusBadgeFallback status={status} />;
  async function updateStatus() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/shipments/${trackingCode}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: next }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not update shipment");
      setStatus(payload.data.status);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update shipment");
    } finally {
      setSaving(false);
    }
  }
  return <div><button className="button" disabled={saving} onClick={updateStatus}>{saving ? "Saving…" : `Mark ${statusLabels[next]}`}</button>{error ? <small style={{ display: "block", color: "var(--red)", marginTop: 6 }}>{error}</small> : null}</div>;
}

function StatusBadgeFallback({ status }: { status: ShipmentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{statusLabels[status]}</span>;
}
