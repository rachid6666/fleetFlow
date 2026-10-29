import { statusLabels, type ShipmentStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{statusLabels[status]}</span>;
}
