import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

async function main() {
  const { syncAuthentikDirectoryUsers } = await import("../src/lib/authentik-directory");
  const [directoryUsers, facilityCount] = await Promise.all([
    syncAuthentikDirectoryUsers(),
    prisma.kaggleFacility.count(),
  ]);

  console.log(`Synced ${directoryUsers.filter((user) => user.role === "DRIVER").length} Authentik drivers.`);
  console.log(`Synced ${directoryUsers.filter((user) => user.role === "CUSTOMER").length} Authentik customers.`);
  console.log(`Available U.S. storage locations: ${facilityCount}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => { const { closeAuthentikDirectoryPool } = await import("../src/lib/authentik-directory"); await Promise.allSettled([prisma.$disconnect(), closeAuthentikDirectoryPool()]); });
