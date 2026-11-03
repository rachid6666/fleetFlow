import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

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

  const admin = await prisma.user.upsert({
    where: { email: "admin@fleetflow.local" },
    update: { name: "Local Admin", role: "ADMIN" },
    create: { id: "local-admin", email: "admin@fleetflow.local", password: "local-seed-only", name: "Local Admin", role: "ADMIN" },
  });
  const driverOne = await prisma.user.upsert({
    where: { email: "driver.one@fleetflow.local" },
    update: { name: "Driver One", role: "DRIVER" },
    create: { id: "local-driver-one", email: "driver.one@fleetflow.local", password: "local-seed-only", name: "Driver One", role: "DRIVER" },
  });
  await prisma.user.upsert({
    where: { email: "driver.two@fleetflow.local" },
    update: { name: "Driver Two", role: "DRIVER" },
    create: { id: "local-driver-two", email: "driver.two@fleetflow.local", password: "local-seed-only", name: "Driver Two", role: "DRIVER" },
  });
  const customer = await prisma.user.upsert({
    where: { email: "customer@fleetflow.local" },
    update: { name: "Local Customer", role: "CUSTOMER" },
    create: { id: "local-customer", email: "customer@fleetflow.local", password: "local-seed-only", name: "Local Customer", role: "CUSTOMER" },
  });
  await prisma.shipment.upsert({
    where: { trackingCode: "FF-LOCAL-001" },
    update: { origin: "Algiers", destination: "Oran", status: "IN_TRANSIT", driverId: driverOne.id, customerId: customer.id, notes: "Seed shipment for local smoke checks." },
    create: { id: "local-shipment-001", trackingCode: "FF-LOCAL-001", origin: "Algiers", destination: "Oran", status: "IN_TRANSIT", driverId: driverOne.id, customerId: customer.id, notes: "Seed shipment for local smoke checks.", updates: { create: { status: "IN_TRANSIT", actorEmail: admin.email, description: "Seed shipment created for local development" } } },
  });
}

main().finally(() => prisma.$disconnect());
