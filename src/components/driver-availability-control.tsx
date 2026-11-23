"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Availability = "AVAILABLE" | "UNAVAILABLE";

export function DriverAvailabilityControl({
  driverId,
  current,
  canSelectDriver = false,
  driverName,
}: {
  driverId?: string;
  current: Availability;
  canSelectDriver?: boolean;
  driverName?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(next: Availability) {
    const previous = value;
    setValue(next);
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/drivers/availability", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...(canSelectDriver ? { driverId } : {}), availability: next }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not update availability");
      router.refresh();
    } catch (cause) {
      setValue(previous);
      setError(cause instanceof Error ? cause.message : "Could not update availability");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="availability-control">
      <select
        aria-label={driverName ? `Availability for ${driverName}` : "Driver availability"}
        value={value}
        disabled={saving}
        onChange={(event) => update(event.target.value as Availability)}
      >
        <option value="AVAILABLE">Available</option>
        <option value="UNAVAILABLE">Unavailable</option>
      </select>
      {error ? <small role="alert">{error}</small> : null}
    </div>
  );
}
