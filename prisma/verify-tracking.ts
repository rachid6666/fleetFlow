import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

async function main() {
  const shipments = await prisma.shipment.findMany({
    where: { trackingCode: { startsWith: "FF-LIVE-" } },
    include: { locationPings: { orderBy: { recordedAt: "asc" } } },
    orderBy: { trackingCode: "asc" },
  });
  const pingCount = shipments.reduce((total, shipment) => total + shipment.locationPings.length, 0);
  console.log(`PASS synthetic shipments: ${shipments.length}`);
  console.log(`PASS GPS pings: ${pingCount}`);
  for (const shipment of shipments) {
    const latest = shipment.locationPings[shipment.locationPings.length - 1];
    console.log(`${shipment.trackingCode} ${shipment.status} pings=${shipment.locationPings.length} latest=${latest?.latitude},${latest?.longitude}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());