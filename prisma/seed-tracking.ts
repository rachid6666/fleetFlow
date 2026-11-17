import { loadEnvConfig } from "@next/env";
import { PrismaClient, type ShipmentStatus } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

type City = { name: string; latitude: number; longitude: number };
type SyntheticRoute = {
  id: string;
  trackingCode: string;
  origin: City;
  destination: City;
  status: ShipmentStatus;
  progress: number;
  note: string;
};

const cities: Record<string, City> = {
  Dallas: { name: "Dallas", latitude: 32.7767, longitude: -96.797 },
  Atlanta: { name: "Atlanta", latitude: 33.749, longitude: -84.388 },
  Chicago: { name: "Chicago", latitude: 41.8781, longitude: -87.6298 },
  Denver: { name: "Denver", latitude: 39.7392, longitude: -104.9903 },
  Phoenix: { name: "Phoenix", latitude: 33.4484, longitude: -112.074 },
  "Los Angeles": { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437 },
  Portland: { name: "Portland", latitude: 45.5152, longitude: -122.6784 },
  Seattle: { name: "Seattle", latitude: 47.6062, longitude: -122.3321 },
  Miami: { name: "Miami", latitude: 25.7617, longitude: -80.1918 },
  Charlotte: { name: "Charlotte", latitude: 35.2271, longitude: -80.8431 },
  Houston: { name: "Houston", latitude: 29.7604, longitude: -95.3698 },
  "New York": { name: "New York", latitude: 40.7128, longitude: -74.006 },
  "Kansas City": { name: "Kansas City", latitude: 39.0997, longitude: -94.5786 },
};

const routes: SyntheticRoute[] = [
  { id: "synthetic-live-001", trackingCode: "FF-LIVE-0001", origin: cities.Dallas, destination: cities.Atlanta, status: "IN_TRANSIT", progress: 0.68, note: "Synthetic live route crossing the Southeast corridor." },
  { id: "synthetic-live-002", trackingCode: "FF-LIVE-0002", origin: cities.Chicago, destination: cities.Denver, status: "IN_TRANSIT", progress: 0.47, note: "Synthetic live route through the central freight corridor." },
  { id: "synthetic-live-003", trackingCode: "FF-LIVE-0003", origin: cities.Phoenix, destination: cities["Los Angeles"], status: "IN_TRANSIT", progress: 0.27, note: "Synthetic live route moving into Southern California." },
  { id: "synthetic-live-004", trackingCode: "FF-LIVE-0004", origin: cities.Portland, destination: cities.Seattle, status: "DELIVERED", progress: 1, note: "Synthetic completed route for delivery-history checks." },
  { id: "synthetic-live-005", trackingCode: "FF-LIVE-0005", origin: cities.Miami, destination: cities.Charlotte, status: "EXCEPTION", progress: 0.54, note: "Synthetic exception route with delayed telemetry." },
  { id: "synthetic-live-006", trackingCode: "FF-LIVE-0006", origin: cities.Houston, destination: cities["New York"], status: "DISPATCHED", progress: 0.04, note: "Synthetic route waiting for its first long-distance pings." },
  { id: "synthetic-live-007", trackingCode: "FF-LIVE-0007", origin: cities.Denver, destination: cities["Kansas City"], status: "IN_TRANSIT", progress: 0.82, note: "Synthetic live route approaching the Kansas City terminal." },
];

function interpolate(origin: City, destination: City, progress: number) {
  const curve = Math.sin(Math.PI * progress) * 0.05;
  return {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * progress + curve,
    longitude: origin.longitude + (destination.longitude - origin.longitude) * progress - curve,
  };
}

function heading(origin: City, destination: City) {
  const deltaLon = destination.longitude - origin.longitude;
  const deltaLat = destination.latitude - origin.latitude;
  return Math.round(((Math.atan2(deltaLon, deltaLat) * 180) / Math.PI + 360) % 360);
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@fleetflow.local" },
    update: { name: "Local Admin", role: "ADMIN" },
    create: { id: "local-admin", email: "admin@fleetflow.local", password: "local-seed-only", name: "Local Admin", role: "ADMIN" },
  });
  const drivers = await Promise.all([
    prisma.user.upsert({
      where: { email: "driver.one@fleetflow.local" },
      update: { name: "Driver One", role: "DRIVER" },
      create: { id: "local-driver-one", email: "driver.one@fleetflow.local", password: "local-seed-only", name: "Driver One", role: "DRIVER" },
    }),
    prisma.user.upsert({
      where: { email: "driver.two@fleetflow.local" },
      update: { name: "Driver Two", role: "DRIVER" },
      create: { id: "local-driver-two", email: "driver.two@fleetflow.local", password: "local-seed-only", name: "Driver Two", role: "DRIVER" },
    }),
  ]);
  const customer = await prisma.user.upsert({
    where: { email: "customer@fleetflow.local" },
    update: { name: "Local Customer", role: "CUSTOMER" },
    create: { id: "local-customer", email: "customer@fleetflow.local", password: "local-seed-only", name: "Local Customer", role: "CUSTOMER" },
  });

  const now = Date.now();
  let pingCount = 0;

  for (const [index, route] of routes.entries()) {
    const shipment = await prisma.shipment.upsert({
      where: { trackingCode: route.trackingCode },
      update: {
        origin: route.origin.name,
        destination: route.destination.name,
        originLatitude: route.origin.latitude,
        originLongitude: route.origin.longitude,
        destinationLatitude: route.destination.latitude,
        destinationLongitude: route.destination.longitude,
        estimatedArrival: route.status === 'DELIVERED' ? new Date(now - 20 * 60_000) : new Date(now + Math.max(45, Math.round((1 - route.progress) * 360)) * 60_000),
        status: route.status,
        driverId: drivers[index % drivers.length].id,
        customerId: customer.id,
        notes: route.note,
      },
      create: {
        id: route.id,
        trackingCode: route.trackingCode,
        origin: route.origin.name,
        destination: route.destination.name,
        originLatitude: route.origin.latitude,
        originLongitude: route.origin.longitude,
        destinationLatitude: route.destination.latitude,
        destinationLongitude: route.destination.longitude,
        estimatedArrival: route.status === 'DELIVERED' ? new Date(now - 20 * 60_000) : new Date(now + Math.max(45, Math.round((1 - route.progress) * 360)) * 60_000),
        status: route.status,
        driverId: drivers[index % drivers.length].id,
        customerId: customer.id,
        notes: route.note,
      },
    });

    const existingLogs = await prisma.statusLog.count({ where: { shipmentId: shipment.id } });
    if (existingLogs === 0) {
      await prisma.statusLog.create({
        data: { shipmentId: shipment.id, status: route.status, actorEmail: admin.email, description: "Synthetic live tracking shipment initialized" },
      });
    }

    await prisma.shipmentLocationPing.deleteMany({ where: { shipmentId: shipment.id, source: "synthetic" } });

    const pointCount = route.status === "EXCEPTION" ? 10 : 18;
    const endOffsetMinutes = route.status === "EXCEPTION" ? 180 : route.status === "DELIVERED" ? 20 : 2;
    const startProgress = Math.max(0, route.progress - 0.3);
    const direction = heading(route.origin, route.destination);
    const pings = Array.from({ length: pointCount }, (_, pointIndex) => {
      const ratio = pointIndex / (pointCount - 1);
      const progress = startProgress + (route.progress - startProgress) * ratio;
      const position = interpolate(route.origin, route.destination, progress);
      const minutesAgo = endOffsetMinutes + (pointCount - 1 - pointIndex) * 18;
      return {
        shipmentId: shipment.id,
        latitude: position.latitude,
        longitude: position.longitude,
        speedMph: route.status === "DISPATCHED" && pointIndex === 0 ? 0 : 42 + ((index * 7 + pointIndex * 3) % 25),
        headingDegrees: direction,
        recordedAt: new Date(now - minutesAgo * 60_000),
        source: "synthetic",
      };
    });

    await prisma.shipmentLocationPing.createMany({ data: pings });
    pingCount += pings.length;
  }

  console.log(`Seeded ${routes.length} synthetic live shipments and ${pingCount} GPS pings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());