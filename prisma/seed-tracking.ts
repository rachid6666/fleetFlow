import { loadEnvConfig } from "@next/env";
import { PrismaClient, type ShipmentStatus } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

type FacilityLocation = {
  city: string;
  state: string;
};

type SyntheticRoute = FacilityLocation & {
  destination: FacilityLocation;
  id: string;
  trackingCode: string;
  status: ShipmentStatus;
  progress: number;
  note: string;
};

const routes: SyntheticRoute[] = [
  {
    id: "synthetic-live-001",
    trackingCode: "FF-LIVE-0001",
    city: "Dallas",
    state: "TX",
    destination: { city: "Atlanta", state: "GA" },
    status: "IN_TRANSIT",
    progress: 0.68,
    note: "Synthetic live route crossing the Southeast corridor.",
  },
  {
    id: "synthetic-live-002",
    trackingCode: "FF-LIVE-0002",
    city: "Chicago",
    state: "IL",
    destination: { city: "Denver", state: "CO" },
    status: "IN_TRANSIT",
    progress: 0.47,
    note: "Synthetic live route through the central freight corridor.",
  },
  {
    id: "synthetic-live-003",
    trackingCode: "FF-LIVE-0003",
    city: "Phoenix",
    state: "AZ",
    destination: { city: "Los Angeles", state: "CA" },
    status: "IN_TRANSIT",
    progress: 0.27,
    note: "Synthetic live route moving into Southern California.",
  },
  {
    id: "synthetic-live-004",
    trackingCode: "FF-LIVE-0004",
    city: "Portland",
    state: "OR",
    destination: { city: "Salt Lake City", state: "UT" },
    status: "DELIVERED",
    progress: 1,
    note: "Synthetic completed route for delivery-history checks.",
  },
  {
    id: "synthetic-live-005",
    trackingCode: "FF-LIVE-0005",
    city: "Miami",
    state: "FL",
    destination: { city: "Charlotte", state: "NC" },
    status: "EXCEPTION",
    progress: 0.54,
    note: "Synthetic exception route with delayed telemetry.",
  },
  {
    id: "synthetic-live-006",
    trackingCode: "FF-LIVE-0006",
    city: "Houston",
    state: "TX",
    destination: { city: "New York", state: "NY" },
    status: "DISPATCHED",
    progress: 0.04,
    note: "Synthetic route waiting for its first long-distance pings.",
  },
  {
    id: "synthetic-live-007",
    trackingCode: "FF-LIVE-0007",
    city: "Denver",
    state: "CO",
    destination: { city: "Kansas City", state: "MO" },
    status: "IN_TRANSIT",
    progress: 0.82,
    note: "Synthetic live route approaching the Kansas City terminal.",
  },
];

function routeLabel(city: string, state: string) {
  return `${city}, ${state}`;
}

function interpolate(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  progress: number,
) {
  const curve = Math.sin(Math.PI * progress) * 0.015;
  return {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * progress + curve,
    longitude: origin.longitude + (destination.longitude - origin.longitude) * progress - curve,
  };
}

function heading(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) {
  const deltaLon = destination.longitude - origin.longitude;
  const deltaLat = destination.latitude - origin.latitude;
  return Math.round(((Math.atan2(deltaLon, deltaLat) * 180) / Math.PI + 360) % 360);
}

function facilityFor(
  facilities: Awaited<ReturnType<typeof prisma.kaggleFacility.findMany>>,
  location: FacilityLocation,
) {
  const facility = facilities.find(
    (candidate) => candidate.city === location.city && candidate.state === location.state,
  );
  if (!facility) {
    throw new Error(`No Neon facility found for ${routeLabel(location.city, location.state)}.`);
  }
  return facility;
}

async function main() {
  const { closeAuthentikDirectoryPool, syncAuthentikDirectoryUsers } = await import(
    "../src/lib/authentik-directory"
  );
  await syncAuthentikDirectoryUsers();

  const [facilities, drivers, customers] = await Promise.all([
    prisma.kaggleFacility.findMany({ orderBy: { facilityId: "asc" } }),
    prisma.user.findMany({
      where: { role: "DRIVER" },
      orderBy: { email: "asc" },
      select: { id: true, email: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { email: "asc" },
      select: { id: true, email: true, name: true },
    }),
  ]);

  if (!drivers.length) throw new Error("No active Authentik drivers are available for live routes.");
  if (!customers.length) throw new Error("No active Authentik customers are available for live routes.");

  const now = Date.now();
  let pingCount = 0;

  try {
    for (const [index, route] of routes.entries()) {
      const originFacility = facilityFor(facilities, route);
      const destinationFacility = facilityFor(facilities, route.destination);
      const origin = {
        latitude: Number(originFacility.latitude),
        longitude: Number(originFacility.longitude),
      };
      const destination = {
        latitude: Number(destinationFacility.latitude),
        longitude: Number(destinationFacility.longitude),
      };
      const originLabel = routeLabel(originFacility.city, originFacility.state);
      const destinationLabel = routeLabel(destinationFacility.city, destinationFacility.state);
      const driver = drivers[index % drivers.length];
      const customer = customers[index % customers.length];
      const estimatedArrival = route.status === "DELIVERED"
        ? new Date(now - 20 * 60_000)
        : new Date(now + Math.max(45, Math.round((1 - route.progress) * 360)) * 60_000);

      const shipment = await prisma.shipment.upsert({
        where: { trackingCode: route.trackingCode },
        update: {
          origin: originLabel,
          destination: destinationLabel,
          originLatitude: origin.latitude,
          originLongitude: origin.longitude,
          destinationLatitude: destination.latitude,
          destinationLongitude: destination.longitude,
          originBranchId: null,
          destinationBranchId: null,
          originFacilityId: originFacility.facilityId,
          destinationFacilityId: destinationFacility.facilityId,
          estimatedArrival,
          status: route.status,
          driverId: driver.id,
          customerId: customer.id,
          assignmentStatus: "ACCEPTED",
          notes: route.note,
        },
        create: {
          id: route.id,
          trackingCode: route.trackingCode,
          origin: originLabel,
          destination: destinationLabel,
          originLatitude: origin.latitude,
          originLongitude: origin.longitude,
          destinationLatitude: destination.latitude,
          destinationLongitude: destination.longitude,
          originFacilityId: originFacility.facilityId,
          destinationFacilityId: destinationFacility.facilityId,
          estimatedArrival,
          status: route.status,
          driverId: driver.id,
          customerId: customer.id,
          assignmentStatus: "ACCEPTED",
          notes: route.note,
        },
      });

      await prisma.statusLog.deleteMany({
        where: {
          shipmentId: shipment.id,
          description: { startsWith: "Synthetic live tracking" },
        },
      });
      await prisma.statusLog.create({
        data: {
          shipmentId: shipment.id,
          status: route.status,
          actorEmail: "system:synthetic-live-seed",
          location: originLabel,
          description: `Synthetic live tracking shipment initialized for ${originLabel} to ${destinationLabel}`,
        },
      });

      await prisma.shipmentLocationPing.deleteMany({
        where: { shipmentId: shipment.id, source: "synthetic" },
      });

      const pointCount = route.status === "EXCEPTION" ? 10 : 18;
      const endOffsetMinutes = route.status === "EXCEPTION" ? 180 : route.status === "DELIVERED" ? 20 : 2;
      const startProgress = Math.max(0.02, route.progress - 0.3);
      const direction = heading(origin, destination);
      const pings = Array.from({ length: pointCount }, (_, pointIndex) => {
        const ratio = pointIndex / (pointCount - 1);
        const progress = startProgress + (route.progress - startProgress) * ratio;
        const position = interpolate(origin, destination, progress);
        const minutesAgo = endOffsetMinutes + (pointCount - 1 - pointIndex) * 18;
        return {
          shipmentId: shipment.id,
          latitude: position.latitude,
          longitude: position.longitude,
          speedMph: route.status === "DISPATCHED" && pointIndex === 0
            ? 0
            : 42 + ((index * 7 + pointIndex * 3) % 25),
          headingDegrees: direction,
          recordedAt: new Date(now - minutesAgo * 60_000),
          source: "synthetic",
        };
      });

      await prisma.shipmentLocationPing.createMany({ data: pings });
      pingCount += pings.length;
    }

    console.log(`Seeded ${routes.length} synthetic live shipments and ${pingCount} GPS pings.`);
    console.log(`Using ${drivers.length} Authentik driver(s), ${customers.length} customer(s), and ${facilities.length} Neon facilities.`);
  } finally {
    await closeAuthentikDirectoryPool();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
