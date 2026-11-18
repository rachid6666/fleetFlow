"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AssignmentResponseActions({ trackingCode }: { trackingCode: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(assignmentStatus: "ACCEPTED" | "REJECTED") {
    setSaving(assignmentStatus);
    setError(null);
    try {
      const response = await fetch(`/api/shipments/${trackingCode}/assignment-response`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assignmentStatus }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not respond to assignment");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not respond to assignment");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="assignment-response-actions">
      <button className="button" type="button" disabled={saving !== null} onClick={() => respond("ACCEPTED")}>
        {saving === "ACCEPTED" ? "Accepting…" : "Accept assignment"}
      </button>
      <button className="button secondary" type="button" disabled={saving !== null} onClick={() => respond("REJECTED")}>
        {saving === "REJECTED" ? "Rejecting…" : "Reject"}
      </button>
      {error ? <small role="alert">{error}</small> : null}
    </div>
  );
}
