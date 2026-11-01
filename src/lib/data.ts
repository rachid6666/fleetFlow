import { Prisma, type ShipmentStatus } from "@prisma/client";
import { assertTransition } from "./shipment-rules";
import { prisma } from "./prisma";
import type { Shipment, ShipmentEvent } from "./types";

const shipmentInclude = {
  driver: { select: { name: true, email: true } },
  customer: { select: { name: true } },
} satisfies Prisma.ShipmentInclude;

type ShipmentRecord = Prisma.ShipmentGetPayload<{
  include: typeof shipmentInclude;
}>;

function formatUpdatedAt(date: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  if (hours < 48) return "Yesterday";
  return date.toLocaleDateString();
}

function formatEta(status: ShipmentStatus) {
  if (status === "DELIVERED") return "Delivered";
  if (status === "EXCEPTION") return "Needs review";
  return "Not scheduled";
}

function toShipment(record: ShipmentRecord): Shipment {
  return {
    id: record.id,
    trackingCode: record.trackingCode,
    origin: record.origin,
    destination: record.destination,
    status: record.status,
    driverName: record.driver?.name ?? null,
    customerName: record.customer.name,
    updatedAt: formatUpdatedAt(record.updatedAt),
    eta: formatEta(record.status),
    notes: record.notes ?? undefined,
  };
}

export async function listShipments() {
  const records = await prisma.shipment.findMany({
    include: shipmentInclude,
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toShipment);
}

export async function listShipmentsForDriver(email: string) {
  const records = await prisma.shipment.findMany({
    where: { driver: { email: { equals: email, mode: "insensitive" } } },
    include: shipmentInclude,
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toShipment);
}

export async function getRecentActivity(take = 3) {
  return prisma.statusLog.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: {
      status: true,
      description: true,
      createdAt: true,
      shipment: { select: { trackingCode: true } },
    },
  });
}

export async function countDeliveredSince(date: Date) {
  return prisma.shipment.count({
    where: { status: "DELIVERED", updatedAt: { gte: date } },
  });
}

export async function getLogisticsDashboard() {
  const [
    totalLoads,
    loadRevenue,
    tripTotals,
    activeDrivers,
    activeTrucks,
    totalDeliveryEvents,
    onTimeDeliveryEvents,
    safetyIncidents,
    recentLoads,
  ] = await Promise.all([
    prisma.kaggleLoad.count(),
    prisma.kaggleLoad.aggregate({ _sum: { revenue: true } }),
    prisma.kaggleTrip.aggregate({
      _sum: { actualDistanceMiles: true },
      _avg: { averageMpg: true },
    }),
    prisma.kaggleDriver.count({ where: { employmentStatus: "Active" } }),
    prisma.kaggleTruck.count({ where: { status: "Active" } }),
    prisma.kaggleDeliveryEvent.count(),
    prisma.kaggleDeliveryEvent.count({ where: { onTimeFlag: true } }),
    prisma.kaggleSafetyIncident.count(),
    prisma.kaggleLoad.findMany({
      take: 8,
      orderBy: { loadDate: "desc" },
      select: {
        loadId: true,
        loadDate: true,
        loadType: true,
        loadStatus: true,
        revenue: true,
        customer: { select: { customerName: true } },
        route: {
          select: {
            originCity: true,
            originState: true,
            destinationCity: true,
            destinationState: true,
          },
        },
      },
    }),
  ]);

  return {
    totalLoads,
    totalRevenue: loadRevenue._sum.revenue?.toNumber() ?? 0,
    totalMiles: tripTotals._sum.actualDistanceMiles ?? 0,
    averageMpg: tripTotals._avg.averageMpg?.toNumber() ?? 0,
    activeDrivers,
    activeTrucks,
    totalDeliveryEvents,
    onTimeDeliveryRate:
      totalDeliveryEvents === 0 ? 0 : (onTimeDeliveryEvents / totalDeliveryEvents) * 100,
    safetyIncidents,
    recentLoads,
  };
}

export async function getShipmentByTrackingCode(code: string) {
  const shipment = await prisma.shipment.findFirst({
    where: { trackingCode: { equals: code.trim(), mode: "insensitive" } },
    select: {
      id: true,
      trackingCode: true,
      origin: true,
      destination: true,
      status: true,
      updatedAt: true,
      updates: {
        orderBy: { createdAt: "desc" },
        select: { status: true, description: true, createdAt: true },
      },
    },
  });

  if (!shipment) return undefined;

  const events: ShipmentEvent[] = shipment.updates.map((event) => ({
    status: event.status,
    description: event.description,
    createdAt: event.createdAt.toISOString(),
  }));

  return {
    trackingCode: shipment.trackingCode,
    origin: shipment.origin,
    destination: shipment.destination,
    status: shipment.status,
    eta: formatEta(shipment.status),
    events,
  };
}

type ShipmentActor = {
  email: string;
  role: "ADMIN" | "DRIVER";
};

export async function transitionShipmentStatus(
  trackingCode: string,
  status: ShipmentStatus,
  notes: string | undefined,
  actor: ShipmentActor,
): Promise<
  | { kind: "not-found" }
  | { kind: "forbidden" }
  | { kind: "updated"; shipment: Shipment }
> {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.shipment.findFirst({
      where: { trackingCode: { equals: trackingCode.trim(), mode: "insensitive" } },
      include: { driver: { select: { email: true } } },
    });

    if (!current) return { kind: "not-found" };
    if (
      actor.role === "DRIVER" &&
      current.driver?.email.toLowerCase() !== actor.email.toLowerCase()
    ) {
      return { kind: "forbidden" };
    }

    assertTransition(current.status, status);

    const updated = await transaction.shipment.update({
      where: { id: current.id },
      data: {
        status,
        ...(notes === undefined ? {} : { notes }),
      },
      include: shipmentInclude,
    });

    await transaction.statusLog.create({
      data: {
        shipmentId: updated.id,
        status,
        actorEmail: actor.email,
        description: `Status changed to ${status}`,
      },
    });

    return { kind: "updated", shipment: toShipment(updated) };
  });
}
