"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function DeliveryNoteForm({ trackingCode }: { trackingCode: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/shipments/${trackingCode}/notes`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          notes: String(form.get("notes") ?? ""),
          location: String(form.get("location") ?? "") || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not save delivery note");

      setNotice("Delivery note saved");
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save delivery note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="delivery-note-control">
      {notice ? <span className="delivery-note-notice" role="status">{notice}</span> : null}
      {!open ? (
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setNotice(null);
            setError(null);
            setOpen(true);
          }}
        >
          Add delivery note
        </button>
      ) : (
        <form className="delivery-note-form" onSubmit={handleSubmit}>
          <label>
            <span>Delivery note</span>
            <textarea
              name="notes"
              rows={3}
              required
              maxLength={2000}
              autoFocus
              placeholder="Delivery confirmation, recipient details, or exception context"
            />
          </label>
          <label>
            <span>Location <small>optional</small></span>
            <input name="location" maxLength={200} placeholder="City, dock, or delivery address" />
          </label>
          {error ? <p className="delivery-note-error" role="alert">{error}</p> : null}
          <div className="delivery-note-actions">
            <button className="button secondary" type="button" disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
