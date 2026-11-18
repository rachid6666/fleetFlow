"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { statusLabels, type ShipmentStatus } from "@/lib/types";
import { getAvailableTransitions } from "@/lib/shipment-rules";

export function StatusActions({ trackingCode, current }: { trackingCode: string; current: ShipmentStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [saving, setSaving] = useState<ShipmentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nextStatuses = getAvailableTransitions(status);

  if (nextStatuses.length === 0) return <StatusBadgeFallback status={status} />;

  async function updateStatus(next: ShipmentStatus) {
    setSaving(next);
    setError(null);
    try {
      const response = await fetch(`/api/shipments/${trackingCode}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: next }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not update shipment");
      setStatus(payload.data.status);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update shipment");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="status-action-group">
      {nextStatuses.map((next, index) => (
        <button
          className={`button${next === "EXCEPTION" || index > 0 ? " secondary" : ""}`}
          type="button"
          disabled={saving !== null}
          onClick={() => updateStatus(next)}
          key={next}
        >
          {saving === next ? "Saving…" : transitionLabel(next)}
        </button>
      ))}
      {error ? <small className="status-action-error">{error}</small> : null}
    </div>
  );
}

function StatusBadgeFallback({ status }: { status: ShipmentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{statusLabels[status]}</span>;
}

function transitionLabel(status: ShipmentStatus) {
  if (status === "DISPATCHED") return "Dispatch";
  if (status === "IN_TRANSIT") return "Mark in transit";
  if (status === "DELIVERED") return "Mark delivered";
  return "Report exception";
}
