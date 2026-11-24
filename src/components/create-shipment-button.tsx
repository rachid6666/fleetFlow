"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { ShipmentFormOptions } from "@/lib/data";

export function CreateShipmentButton({
  options,
  allowDriverAssignment = true,
}: {
  options: ShipmentFormOptions;
  allowDriverAssignment?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formOptions, setFormOptions] = useState(options);
  const [refreshingOptions, setRefreshingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("[autofocus]")?.focus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [open]);

  useEffect(() => {
    setFormOptions(options);
  }, [options]);

  async function refreshOptionsFromNeon() {
    setRefreshingOptions(true);
    setOptionsError(null);
    try {
      const response = await fetch("/api/shipments/form-options", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not refresh shipment options");
      if (!Array.isArray(payload.locations) || !Array.isArray(payload.drivers) || !Array.isArray(payload.customers)) {
        throw new Error("Shipment options response was invalid");
      }
      setFormOptions(payload as ShipmentFormOptions);
    } catch (cause) {
      setOptionsError(cause instanceof Error ? cause.message : "Could not refresh shipment options");
    } finally {
      setRefreshingOptions(false);
    }
  }

  function showDialog() {
    setError(null);
    setNotice(null);
    setOpen(true);
    void refreshOptionsFromNeon();
  }

  function closeDialog() {
    if (saving) return;
    setError(null);
    setOpen(false);
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const originFacilityId = String(form.get("originFacilityId") ?? "");
    const destinationFacilityId = String(form.get("destinationFacilityId") ?? "");

    if (originFacilityId === destinationFacilityId) {
      setError("Origin and destination must be different storage locations");
      return;
    }

    const driverId = String(form.get("driverId") ?? "");
    const notes = String(form.get("notes") ?? "").trim();
    const chargeAmount = Number(form.get("chargeAmount"));
    if (!Number.isFinite(chargeAmount) || chargeAmount <= 0) {
      setError("Enter a shipment charge greater than zero");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          originFacilityId,
          destinationFacilityId,
          customerId: String(form.get("customerId") ?? ""),
          driverId: driverId || null,
          chargeAmount,
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

  const defaultOriginLocation = formOptions.locations[0];
  const defaultDestinationLocation = formOptions.locations.find((location) =>
    location.id !== defaultOriginLocation?.id
    && (location.city !== defaultOriginLocation?.city || location.state !== defaultOriginLocation?.state),
  ) ?? formOptions.locations[1];

  return (
    <div className="create-shipment-control">
      {notice ? <span className="shipment-form-notice" role="status">{notice}</span> : null}
      <button
        ref={triggerRef}
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
            ref={dialogRef}
            className="shipment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-shipment-title"
            aria-describedby="create-shipment-description"
            onKeyDown={handleDialogKeyDown}
          >
            <div className="shipment-modal-heading">
              <div>
                <div className="eyebrow">New shipment</div>
                <h2 id="create-shipment-title">Create shipment</h2>
                <p id="create-shipment-description">Choose the U.S. storage locations, customer, and shipment charge. A tracking code will be generated automatically.</p>
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

            <form className="shipment-form" onSubmit={handleSubmit} aria-busy={refreshingOptions}>
              {refreshingOptions ? (
                <p className="shipment-form-hint" role="status">Refreshing U.S. storage locations from Neon and people from Authentik…</p>
              ) : null}
              {optionsError ? (
                <p className="shipment-form-error" role="alert">
                  {optionsError}. Showing the last options loaded from the connected directories.
                </p>
              ) : null}

              <div className="shipment-form-grid">
<label className="form-field">
                  <span>Origin storage location</span>
                  <select name="originFacilityId" required autoFocus defaultValue={defaultOriginLocation?.id ?? ""}>
                    <option value="" disabled>Select origin location</option>
                    {formOptions.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.city}, {location.state} · {location.name} ({location.id}) · {location.dockDoors} doors
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Destination storage location</span>
                  <select name="destinationFacilityId" required defaultValue={defaultDestinationLocation?.id ?? ""}>
                    <option value="" disabled>Select destination location</option>
                    {formOptions.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.city}, {location.state} · {location.name} ({location.id}) · {location.dockDoors} doors
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Customer</span>
                  <select name="customerId" required defaultValue="">
                    <option value="" disabled>Select customer</option>
                    {formOptions.customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} · {customer.email}
                      </option>
                    ))}
                  </select>
                </label>

                {allowDriverAssignment ? (
                  <label className="form-field">
                    <span>Driver <small>optional</small></span>
                    <select name="driverId" defaultValue="">
                      <option value="">Leave unassigned</option>
                      {formOptions.drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} | {driver.email}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="form-field">
                  <span>Shipment charge <small>USD</small></span>
                  <input
                    name="chargeAmount"
                    type="number"
                    min="0.01"
                    max="100000000"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    required
                  />
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
