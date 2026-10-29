import type { Shipment } from "./types";

// Demo data keeps the first UI slice usable before PostgreSQL is configured.
// Replace this module with Prisma reads once DATABASE_URL is available.
export const demoShipments: Shipment[] = [
  {
    id: "shp_001",
    trackingCode: "FF-2048-AL",
    origin: "Algiers",
    destination: "Oran",
    status: "IN_TRANSIT",
    driverName: "Nadia Benali",
    customerName: "Atlas Market",
    updatedAt: "12 min ago",
    eta: "Today, 18:30",
    notes: "Driver confirmed highway route.",
  },
  {
    id: "shp_002",
    trackingCode: "FF-2049-AL",
    origin: "Blida",
    destination: "Sétif",
    status: "DISPATCHED",
    driverName: "Yacine Amari",
    customerName: "Cedar Supplies",
    updatedAt: "38 min ago",
    eta: "Tomorrow, 09:15",
  },
  {
    id: "shp_003",
    trackingCode: "FF-2050-AL",
    origin: "Béjaïa",
    destination: "Tizi Ouzou",
    status: "EXCEPTION",
    driverName: "Nadia Benali",
    customerName: "Kabyle Home",
    updatedAt: "1 hr ago",
    eta: "Needs review",
    notes: "Recipient address needs confirmation.",
  },
  {
    id: "shp_004",
    trackingCode: "FF-2051-AL",
    origin: "Constantine",
    destination: "Annaba",
    status: "DELIVERED",
    driverName: "Yacine Amari",
    customerName: "Northline Retail",
    updatedAt: "Yesterday",
    eta: "Delivered",
  },
];

export function getShipmentByTrackingCode(code: string) {
  return demoShipments.find(
    (shipment) => shipment.trackingCode.toLowerCase() === code.trim().toLowerCase(),
  );
}

export function updateDemoShipmentStatus(
  trackingCode: string,
  status: Shipment["status"],
  notes?: string,
) {
  const shipment = getShipmentByTrackingCode(trackingCode);
  if (!shipment) return undefined;
  shipment.status = status;
  shipment.updatedAt = "Just now";
  if (notes) shipment.notes = notes;
  if (status === "DELIVERED") shipment.eta = "Delivered";
  return shipment;
}
