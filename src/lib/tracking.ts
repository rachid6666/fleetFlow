import type { ShipmentStatus } from "@prisma/client";
import { prisma } from "./prisma";
import type { CopilotSnapshot, LiveShipment, LiveTrackingData, TrackingPoint } from "./types";

const EARTH_RADIUS_MILES = 3958.8;
let cachedCopilotSnapshot: CopilotSnapshot | null = null;

function radians(value: number) {
  return (value * Math.PI) / 180;
}

function milesBetween(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const latDelta = radians(b.latitude - a.latitude);
  const lonDelta = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const value = Math.sin(latDelta / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function etaLabel(status: ShipmentStatus, estimatedArrival: Date | null) {
  if (status === "DELIVERED") return "Delivered";
  if (status === "EXCEPTION") return "Needs review";
  if (!estimatedArrival) return "Not scheduled";
  return estimatedArrival.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function toPoint(ping: { latitude: unknown; longitude: unknown; speedMph: unknown; headingDegrees: number | null; recordedAt: Date }): TrackingPoint {
  return {
    latitude: Number(ping.latitude),
    longitude: Number(ping.longitude),
    speedMph: ping.speedMph == null ? null : Number(ping.speedMph),
    headingDegrees: ping.headingDegrees,
    recordedAt: ping.recordedAt.toISOString(),
  };
}

export async function getLiveTrackingData(): Promise<LiveTrackingData> {
  const records = await prisma.shipment.findMany({
    where: {
      OR: [
        { locationPings: { some: {} } },
        {
          originFacilityId: { not: null },
          destinationFacilityId: { not: null },
        },
      ],
    },
    include: {
      driver: { select: { name: true } },
      customer: { select: { name: true } },
      locationPings: { orderBy: { recordedAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const shipments: LiveShipment[] = records
    .map((record) => {
      const trail = record.locationPings.map(toPoint);
      const origin = record.originLatitude != null && record.originLongitude != null
        ? { latitude: Number(record.originLatitude), longitude: Number(record.originLongitude) }
        : null;
      const destination = record.destinationLatitude != null && record.destinationLongitude != null
        ? { latitude: Number(record.destinationLatitude), longitude: Number(record.destinationLongitude) }
        : null;
      const fallbackCoordinates = record.status === "DELIVERED" ? destination : origin;
      const fallbackPoint: TrackingPoint | null = fallbackCoordinates
        ? {
            latitude: fallbackCoordinates.latitude,
            longitude: fallbackCoordinates.longitude,
            speedMph: 0,
            headingDegrees: null,
            recordedAt: record.updatedAt.toISOString(),
          }
        : null;
      const latestPoint = trail[trail.length - 1] ?? fallbackPoint;
      if (!latestPoint) return null;

      const totalDistance = origin && destination ? milesBetween(origin, destination) : 0;
      const remainingDistance = destination ? milesBetween(latestPoint, destination) : 0;
      const progressPercent = record.status === "DELIVERED" ? 100 : destination && totalDistance > 0 ? Math.max(0, Math.min(99, Math.round((1 - remainingDistance / totalDistance) * 100))) : 0;
      const minutesSincePing = Math.max(0, Math.floor((Date.now() - new Date(latestPoint.recordedAt).getTime()) / 60_000));
      const hasTelemetry = record.locationPings.length > 0;
      const attention = record.status === "DELIVERED"
        ? "completed"
        : record.status === "EXCEPTION"
          ? "exception"
          : hasTelemetry && minutesSincePing > 30
            ? "stale"
            : "on-track";

      return {
        id: record.id,
        trackingCode: record.trackingCode,
        origin: record.origin,
        destination: record.destination,
        status: record.status,
        driverName: record.driver?.name ?? null,
        customerName: record.customer.name,
        latestPoint,
        originPoint: origin,
        destinationPoint: destination,
        trail,
        progressPercent,
        distanceMiles: Math.round(totalDistance),
        remainingMiles: Math.round(remainingDistance),
        eta: etaLabel(record.status, record.estimatedArrival),
        minutesSincePing,
        attention,
      } satisfies LiveShipment;
    })
    .filter((shipment): shipment is LiveShipment => shipment !== null);

  return {
    shipments,
    summary: {
      total: shipments.length,
      inTransit: shipments.filter((shipment) => shipment.status === "IN_TRANSIT").length,
      exceptions: shipments.filter((shipment) => shipment.status === "EXCEPTION").length,
      stale: shipments.filter((shipment) => shipment.attention === "stale").length,
      delivered: shipments.filter((shipment) => shipment.status === "DELIVERED").length,
    },
    generatedAt: new Date().toISOString(),
  };
}

async function buildOperationsSnapshot(): Promise<CopilotSnapshot> {
  const [live, loadTotal, loadRevenue, eventTotal, eventOnTime, safetyIncidents, activeTrucks, topRoutes, keyFacilities, recentEvents] = await Promise.all([
    getLiveTrackingData(),
    prisma.kaggleLoad.count(),
    prisma.kaggleLoad.aggregate({ _sum: { revenue: true } }),
    prisma.kaggleDeliveryEvent.count(),
    prisma.kaggleDeliveryEvent.count({ where: { onTimeFlag: true } }),
    prisma.kaggleSafetyIncident.count(),
    prisma.kaggleTruck.count({ where: { status: "Active" } }),
    prisma.kaggleRoute.findMany({
      take: 5,
      orderBy: { baseRatePerMile: "desc" },
      select: { originCity: true, originState: true, destinationCity: true, destinationState: true, baseRatePerMile: true, typicalTransitDays: true },
    }),
    prisma.kaggleFacility.findMany({
      take: 5,
      orderBy: { dockDoors: "desc" },
      select: { facilityName: true, facilityType: true, city: true, state: true, dockDoors: true },
    }),
    prisma.statusLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { status: true, description: true, createdAt: true, shipment: { select: { trackingCode: true } } },
    }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    databaseAvailable: true,
    live: live.summary,
    liveShipments: live.shipments.map((shipment) => ({
      trackingCode: shipment.trackingCode,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      progressPercent: shipment.progressPercent,
      minutesSincePing: shipment.minutesSincePing,
      attention: shipment.attention,
    })),
    historical: {
      totalLoads: loadTotal,
      recordedRevenue: loadRevenue._sum.revenue?.toNumber() ?? 0,
      deliveryEvents: eventTotal,
      onTimeRate: eventTotal === 0 ? 0 : (eventOnTime / eventTotal) * 100,
      safetyIncidents,
      activeTrucks,
    },
    topRoutes: topRoutes.map((route) => ({
      route: `${route.originCity}, ${route.originState} → ${route.destinationCity}, ${route.destinationState}`,
      baseRatePerMile: route.baseRatePerMile.toNumber(),
      transitDays: route.typicalTransitDays,
    })),
    keyFacilities: keyFacilities.map((facility) => ({
      name: facility.facilityName,
      type: facility.facilityType,
      city: facility.city,
      state: facility.state,
      dockDoors: facility.dockDoors,
    })),
    recentEvents: recentEvents.map((event) => ({
      trackingCode: event.shipment.trackingCode,
      status: event.status,
      description: event.description,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
function unavailableSnapshot(): CopilotSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    databaseAvailable: false,
    dataNotice: "The cloud database is unavailable. The copilot is running with local AI and an empty operational snapshot.",
    live: { total: 0, inTransit: 0, exceptions: 0, stale: 0, delivered: 0 },
    liveShipments: [],
    historical: { totalLoads: 0, recordedRevenue: 0, deliveryEvents: 0, onTimeRate: 0, safetyIncidents: 0, activeTrucks: 0 },
    topRoutes: [],
    keyFacilities: [],
    recentEvents: [],
  };
}

export async function getOperationsSnapshotSafe(): Promise<CopilotSnapshot> {
  try {
    const snapshot = await buildOperationsSnapshot();
    cachedCopilotSnapshot = snapshot;
    return snapshot;
  } catch {
    if (cachedCopilotSnapshot) {
      return {
        ...cachedCopilotSnapshot,
        databaseAvailable: false,
        dataNotice: "The cloud database is unavailable. Showing the last successful operational snapshot.",
      };
    }
    return unavailableSnapshot();
  }
}

export async function getOperationsSnapshot(): Promise<CopilotSnapshot> {
  return getOperationsSnapshotSafe();
}
