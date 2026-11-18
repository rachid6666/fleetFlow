"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ShipmentFormOptions } from "@/lib/data";

export function DriverAssignment({
  trackingCode,
  currentDriverId,
  drivers,
}: {
  trackingCode: string;
  currentDriverId: string | null;
  drivers: ShipmentFormOptions["drivers"];
}) {
  const router = useRouter();
  const initialValue = currentDriverId ?? "";
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assignDriver(nextValue: string) {
    const previousValue = value;
    setValue(nextValue);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/shipments/${trackingCode}/assignment`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ driverId: nextValue || null }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not assign driver");
      router.refresh();
    } catch (cause) {
      setValue(previousValue);
      setError(cause instanceof Error ? cause.message : "Could not assign driver");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="driver-assignment">
      <select
        aria-label={`Assign driver for ${trackingCode}`}
        value={value}
        disabled={saving}
        onChange={(event) => assignDriver(event.target.value)}
      >
        <option value="">Unassigned</option>
        {drivers.map((driver) => (
          <option key={driver.id} value={driver.id}>
            {driver.name} · {driver.email}
          </option>
        ))}
      </select>
      {error ? <small role="alert">{error}</small> : null}
    </div>
  );
}
