"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ShipmentFormOptions } from "@/lib/data";

export function CreateShipmentButton({ options }: { options: ShipmentFormOptions }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function showDialog() {
    setError(null);
    setNotice(null);
    setOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setError(null);
    setOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const originBranchId = String(form.get("originBranchId") ?? "");
    const destinationBranchId = String(form.get("destinationBranchId") ?? "");

    if (originBranchId === destinationBranchId) {
      setError("Origin and destination must be different branches");
      return;
    }

    const driverId = String(form.get("driverId") ?? "");
    const notes = String(form.get("notes") ?? "").trim();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          originBranchId,
          destinationBranchId,
          customerId: String(form.get("customerId") ?? ""),
          driverId: driverId || null,
          notes: notes || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not create shipment");

      setNotice(`Created ${payload.data.trackingCode}`);
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create shipment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="create-shipment-control">
      {notice ? <span className="shipment-form-notice" role="status">{notice}</span> : null}
      <button
        className="button"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={showDialog}
      >
        + Create shipment
      </button>

      {open ? (
        <div className="modal-backdrop">
          <section
            className="shipment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-shipment-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeDialog();
            }}
          >
            <div className="shipment-modal-heading">
              <div>
                <div className="eyebrow">New shipment</div>
                <h2 id="create-shipment-title">Create shipment</h2>
                <p>Choose the route and customer. A tracking code will be generated automatically.</p>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Close create shipment dialog"
                onClick={closeDialog}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form className="shipment-form" onSubmit={handleSubmit}>
              <div className="shipment-form-grid">
                <label className="form-field">
                  <span>Origin branch</span>
                  <select name="originBranchId" required autoFocus defaultValue={options.branches[0]?.id ?? ""}>
                    <option value="" disabled>Select origin</option>
                    {options.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.city} · {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Destination branch</span>
                  <select name="destinationBranchId" required defaultValue={options.branches[1]?.id ?? ""}>
                    <option value="" disabled>Select destination</option>
                    {options.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.city} · {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Customer</span>
                  <select name="customerId" required defaultValue="">
                    <option value="" disabled>Select customer</option>
                    {options.customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} · {customer.email}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Driver <small>optional</small></span>
                  <select name="driverId" defaultValue="">
                    <option value="">Leave unassigned</option>
                    {options.drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} · {driver.email}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span>Operations notes <small>optional</small></span>
                <textarea
                  name="notes"
                  maxLength={2000}
                  rows={3}
                  placeholder="Special handling, pickup instructions, or internal context"
                />
              </label>

              <p className="shipment-form-hint">
                New shipments start in <strong>Pending</strong> status and can be dispatched from the driver workspace.
              </p>
              {error ? <p className="shipment-form-error" role="alert">{error}</p> : null}

              <div className="shipment-form-actions">
                <button className="button secondary" type="button" onClick={closeDialog} disabled={saving}>
                  Cancel
                </button>
                <button className="button" type="submit" disabled={saving}>
                  {saving ? "Creating…" : "Create shipment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
