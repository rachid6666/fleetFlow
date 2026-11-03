import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { getLogisticsDashboard } from "../src/lib/data";

loadEnvConfig(process.cwd());

const expectedCounts = {
  customers: 200,
  deliveryEvents: 170_820,
  driverMonthlyMetrics: 4_464,
  drivers: 150,
  facilities: 50,
  fuelPurchases: 196_442,
  loads: 85_410,
  maintenanceRecords: 2_920,
  routes: 58,
  safetyIncidents: 170,
  trailers: 180,
  trips: 85_410,
  truckUtilizationMetrics: 3_312,
  trucks: 120,
};

async function main() {
  const prisma = new PrismaClient();
  try {
    const counts = {
      customers: await prisma.kaggleCustomer.count(),
      deliveryEvents: await prisma.kaggleDeliveryEvent.count(),
      driverMonthlyMetrics: await prisma.kaggleDriverMonthlyMetric.count(),
      drivers: await prisma.kaggleDriver.count(),
      facilities: await prisma.kaggleFacility.count(),
      fuelPurchases: await prisma.kaggleFuelPurchase.count(),
      loads: await prisma.kaggleLoad.count(),
      maintenanceRecords: await prisma.kaggleMaintenanceRecord.count(),
      routes: await prisma.kaggleRoute.count(),
      safetyIncidents: await prisma.kaggleSafetyIncident.count(),
      trailers: await prisma.kaggleTrailer.count(),
      trips: await prisma.kaggleTrip.count(),
      truckUtilizationMetrics: await prisma.kaggleTruckUtilizationMetric.count(),
      trucks: await prisma.kaggleTruck.count(),
    };

    for (const [table, expected] of Object.entries(expectedCounts)) {
      const actual = counts[table as keyof typeof counts];
      console.log(`${table}: ${actual} rows`);
      if (actual !== expected) {
        throw new Error(`${table} expected ${expected} rows, found ${actual}`);
      }
    }

    const foreignKeys = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
      FROM pg_constraint
      WHERE contype = 'f'
        AND connamespace = 'public'::regnamespace
        AND conrelid::regclass::text IN (
          'loads',
          'trips',
          'fuel_purchases',
          'maintenance_records',
          'delivery_events',
          'safety_incidents',
          'driver_monthly_metrics',
          'truck_utilization_metrics'
        )
    `;
    if (foreignKeys[0]?.count !== 18) {
      throw new Error(`Expected 18 Kaggle foreign-key constraints, found ${foreignKeys[0]?.count ?? 0}`);
    }

    const sampleLoad = await prisma.kaggleLoad.findFirst({
      select: {
        loadId: true,
        customer: { select: { customerId: true } },
        route: { select: { routeId: true } },
        trip: {
          select: {
            tripId: true,
            driver: { select: { driverId: true } },
            truck: { select: { truckId: true } },
          },
        },
        deliveryEvents: {
          take: 1,
          select: { eventId: true, facility: { select: { facilityId: true } } },
        },
      },
    });
    if (!sampleLoad?.customer.customerId || !sampleLoad.route.routeId) {
      throw new Error("Unable to read related customer and route records");
    }

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    console.log(`Foreign-key constraints: ${foreignKeys[0].count}`);
    console.log(
      `Relations verified: load ${sampleLoad.loadId} -> customer ${sampleLoad.customer.customerId}, route ${sampleLoad.route.routeId}, trip ${sampleLoad.trip?.tripId ?? "none"}, delivery events ${sampleLoad.deliveryEvents.length}`,
    );
    const dashboard = await getLogisticsDashboard();
    if (dashboard.totalLoads !== expectedCounts.loads || dashboard.recentLoads.length === 0) {
      throw new Error("The live logistics dashboard query returned unexpected load data");
    }
    console.log(
      `Dashboard query verified: ${dashboard.totalLoads} loads, $${dashboard.totalRevenue.toFixed(2)} revenue, ${dashboard.totalMiles} miles, ${dashboard.activeDrivers} active drivers, ${dashboard.activeTrucks} active trucks`,
    );
    console.log(`Total dataset rows: ${total}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Dataset verification failed:", error);
  process.exitCode = 1;
});
