"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { DeliveryProof } from "@/lib/types";

export function DeliveryProofUpload({
  trackingCode,
  proofs,
}: {
  trackingCode: string;
  proofs: DeliveryProof[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Select a delivery proof first");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/shipments/${trackingCode}/proof`, {
        method: "POST",
        body: form,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Could not upload delivery proof");
      setNotice("Proof uploaded");
      event.currentTarget.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload delivery proof");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="delivery-proof-control">
      <div className="delivery-proof-heading">
        <strong>Delivery proof</strong>
        <small>PDF, JPG, or PNG · max 10 MB</small>
      </div>
      <form className="delivery-proof-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          name="file"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          disabled={saving}
          aria-label="Upload delivery proof"
        />
        <button className="button secondary" type="submit" disabled={saving}>
          {saving ? "Uploading…" : "Upload proof"}
        </button>
      </form>
      {notice ? <span className="delivery-note-notice" role="status">{notice}</span> : null}
      {error ? <small className="delivery-proof-error" role="alert">{error}</small> : null}
      {proofs.length ? (
        <ul className="delivery-proof-list">
          {proofs.map((proof) => (
            <li key={proof.id}>
              <a href={`/api/shipments/${trackingCode}/proof/${proof.id}`} target="_blank" rel="noreferrer">
                {proof.originalName}
              </a>
              <small>{formatFileSize(proof.sizeBytes)}</small>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
