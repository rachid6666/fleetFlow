import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const branches = [
  ["ALG", "Algiers Hub", "Algiers", "Algeria", "North Africa", 36.7538, 3.0588],
  ["ORN", "Oran Gateway", "Oran", "Algeria", "North Africa", 35.6971, -0.6308],
  ["TUN", "Tunis Partner Hub", "Tunis", "Tunisia", "North Africa", 36.8065, 10.1815],
  ["CAS", "Casablanca Gateway", "Casablanca", "Morocco", "North Africa", 33.5731, -7.5898],
  ["MAD", "Madrid Relay", "Madrid", "Spain", "Europe", 40.4168, -3.7038],
] as const;

async function main() {
  for (const [code, name, city, country, region, latitude, longitude] of branches) {
    await prisma.branch.upsert({
      where: { code },
      update: { name, city, country, region, latitude, longitude, isActive: true },
      create: { code, name, city, country, region, latitude, longitude, isActive: true },
    });
  }
}

main().finally(() => prisma.$disconnect());
