"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

type RecordPaymentButtonProps = {
  shipmentId: string;
  trackingCode: string;
  balanceAmount: number | null;
};

export function RecordPaymentButton({
  shipmentId,
  trackingCode,
  balanceAmount,
}: RecordPaymentButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

  function closeDialog() {
    if (saving) return;
    setError(null);
    setOpen(false);
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a payment amount greater than zero");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shipmentId,
          amount,
          method: String(form.get("method") ?? "BANK_TRANSFER"),
          reference: String(form.get("reference") ?? "").trim() || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not record payment");

      setNotice(`Payment recorded for ${trackingCode}`);
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record payment");
    } finally {
      setSaving(false);
    }
  }

  const suggestedAmount = balanceAmount && balanceAmount > 0 ? balanceAmount.toFixed(2) : "";

  return (
    <div className="table-action-control">
      {notice ? <span className="payment-action-notice" role="status">{notice}</span> : null}
      <button
        ref={triggerRef}
        className="button secondary table-action-button"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Record payment for ${trackingCode}`}
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
      >
        Record payment
      </button>

      {open ? (
        <div className="modal-backdrop">
          <section
            ref={dialogRef}
            className="shipment-modal payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`payment-title-${shipmentId}`}
            onKeyDown={handleDialogKeyDown}
          >
            <div className="shipment-modal-heading">
              <div>
                <div className="eyebrow">Payment ledger</div>
                <h2 id={`payment-title-${shipmentId}`}>Record payment</h2>
                <p>{trackingCode} ? USD</p>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Close payment dialog"
                onClick={closeDialog}
                disabled={saving}
              >
                ?
              </button>
            </div>

            <form className="shipment-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Amount received <small>USD</small></span>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  max="100000000"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={suggestedAmount}
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </label>

              <label className="form-field">
                <span>Payment method</span>
                <select name="method" defaultValue="BANK_TRANSFER">
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="CARD">Card</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label className="form-field">
                <span>Reference <small>optional</small></span>
                <input
                  name="reference"
                  type="text"
                  maxLength={200}
                  placeholder="Transfer, receipt, or transaction reference"
                />
              </label>

              <p className="shipment-form-hint">
                This records an internal payment entry. It does not charge a card or connect to a payment processor.
              </p>
              {error ? <p className="shipment-form-error" role="alert">{error}</p> : null}

              <div className="shipment-form-actions">
                <button className="button secondary" type="button" onClick={closeDialog} disabled={saving}>
                  Cancel
                </button>
                <button className="button" type="submit" disabled={saving}>
                  {saving ? "Recording?" : "Record payment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
