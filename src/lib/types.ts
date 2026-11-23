export type ShipmentStatus =
  | "PENDING"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "EXCEPTION";

export type AssignmentStatus = "ACCEPTED" | "PENDING" | "REJECTED";

export type DeliveryProof = {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
};

export type Shipment = {
  id: string;
  trackingCode: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  assignmentStatus: AssignmentStatus;
  deliveryProofs: DeliveryProof[];
  driverId: string | null;
  driverName: string | null;
  customerName: string;
  updatedAt: string;
  eta: string;
  notes?: string;
};

export type ShipmentEvent = {
  status: ShipmentStatus;
  description: string;
  createdAt: string;
};

export type TrackedShipment = Pick<
  Shipment,
  "trackingCode" | "origin" | "destination" | "status" | "eta"
> & {
  events: ShipmentEvent[];
};

export type CustomerShipment = TrackedShipment & {
  createdAt: string;
  id: string;
  updatedAt: string;
};

export const statusLabels: Record<ShipmentStatus, string> = {
  PENDING: "Pending",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  EXCEPTION: "Exception",
};

export const statusOrder: ShipmentStatus[] = [
  "PENDING",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
];
export type TrackingPoint = {
  latitude: number;
  longitude: number;
  speedMph: number | null;
  headingDegrees: number | null;
  recordedAt: string;
};

export type LiveShipment = {
  id: string;
  trackingCode: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  driverName: string | null;
  customerName: string;
  latestPoint: TrackingPoint;
  originPoint: { latitude: number; longitude: number } | null;
  destinationPoint: { latitude: number; longitude: number } | null;
  trail: TrackingPoint[];
  progressPercent: number;
  distanceMiles: number;
  remainingMiles: number;
  eta: string;
  minutesSincePing: number;
  attention: "on-track" | "stale" | "exception" | "completed";
};

export type LiveTrackingSummary = {
  total: number;
  inTransit: number;
  exceptions: number;
  stale: number;
  delivered: number;
};

export type LiveTrackingData = {
  shipments: LiveShipment[];
  summary: LiveTrackingSummary;
  generatedAt: string;
};

export type FacilityMapLocation = {
  id: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  facilityCount: number;
  dockDoors: number;
  facilityTypes: string[];
};

export type CopilotSnapshot = {
  generatedAt: string;
  databaseAvailable: boolean;
  dataNotice?: string;
  live: LiveTrackingSummary;
  liveShipments: Array<Pick<LiveShipment, "trackingCode" | "origin" | "destination" | "status" | "progressPercent" | "minutesSincePing" | "attention">>;
  historical: {
    totalLoads: number;
    recordedRevenue: number;
    deliveryEvents: number;
    onTimeRate: number;
    safetyIncidents: number;
    activeTrucks: number;
  };
  topRoutes: Array<{ route: string; baseRatePerMile: number; transitDays: number }>;
  keyFacilities: Array<{ name: string; type: string; city: string; state: string; dockDoors: number }>;
  recentEvents: Array<{ trackingCode: string; status: ShipmentStatus; description: string; createdAt: string }>;
};
