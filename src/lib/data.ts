import { Prisma, type AssignmentStatus, type DriverAvailability, type ShipmentStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { assertTransition } from "./shipment-rules";
import { prisma } from "./prisma";
import type { Shipment, ShipmentEvent } from "./types";

const shipmentInclude = {
  driver: { select: { id: true, name: true, email: true } },
  customer: { select: { name: true } },
  deliveryProofs: {
    orderBy: { createdAt: "desc" },
    select: { id: true, originalName: true, contentType: true, sizeBytes: true, createdAt: true },
  },
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
    assignmentStatus: record.assignmentStatus,
    deliveryProofs: record.deliveryProofs.map((proof) => ({
      id: proof.id,
      originalName: proof.originalName,
      contentType: proof.contentType,
      sizeBytes: proof.sizeBytes,
      uploadedAt: proof.createdAt.toISOString(),
    })),
    driverId: record.driverId,
    driverName: record.driver?.name ?? null,
    customerName: record.customer.name,
    updatedAt: formatUpdatedAt(record.updatedAt),
    eta: formatEta(record.status),
    notes: record.notes ?? undefined,
  };
}

export type ShipmentFormOptions = {
  branches: Array<{ id: string; code: string; name: string; city: string; country: string }>;
  drivers: Array<{ id: string; name: string; email: string }>;
  customers: Array<{ id: string; name: string; email: string }>;
};

export type DriverAvailabilityRecord = {
  id: string;
  name: string;
  email: string;
  availability: DriverAvailability;
};

export async function listDrivers(): Promise<DriverAvailabilityRecord[]> {
  return prisma.user.findMany({
    where: { role: "DRIVER" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, availability: true },
  });
}

export async function updateDriverAvailability(
  driverId: string,
  availability: DriverAvailability,
): Promise<DriverAvailabilityRecord | null> {
  const driver = await prisma.user.findFirst({
    where: { id: driverId, role: "DRIVER" },
    select: { id: true },
  });
  if (!driver) return null;

  return prisma.user.update({
    where: { id: driver.id },
    data: { availability },
    select: { id: true, name: true, email: true, availability: true },
  });
}

export async function updateDriverAvailabilityByEmail(
  email: string,
  availability: DriverAvailability,
): Promise<DriverAvailabilityRecord | null> {
  const driver = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, role: "DRIVER" },
    select: { id: true },
  });
  if (!driver) return null;
  return updateDriverAvailability(driver.id, availability);
}

export type CreateShipmentInput = {
  originBranchId: string;
  destinationBranchId: string;
  customerId: string;
  driverId?: string | null;
  notes?: string;
  actorEmail: string;
};

export type CreateShipmentResult =
  | { kind: "created"; shipment: Shipment }
  | { kind: "invalid"; message: string };

export async function getShipmentFormOptions(): Promise<ShipmentFormOptions> {
  const [branches, drivers, customers] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: [{ country: "asc" }, { city: "asc" }],
      select: { id: true, code: true, name: true, city: true, country: true },
    }),
    prisma.user.findMany({
      where: { role: "DRIVER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return { branches, drivers, customers };
}

export async function createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
  const [originBranch, destinationBranch, customer, driver] = await Promise.all([
    prisma.branch.findFirst({ where: { id: input.originBranchId, isActive: true } }),
    prisma.branch.findFirst({ where: { id: input.destinationBranchId, isActive: true } }),
    prisma.user.findFirst({ where: { id: input.customerId, role: "CUSTOMER" } }),
    input.driverId
      ? prisma.user.findFirst({ where: { id: input.driverId, role: "DRIVER" } })
      : Promise.resolve(null),
  ]);

  if (!originBranch) return { kind: "invalid", message: "Select a valid origin branch" };
  if (!destinationBranch) return { kind: "invalid", message: "Select a valid destination branch" };
  if (originBranch.id === destinationBranch.id) {
    return { kind: "invalid", message: "Origin and destination must be different branches" };
  }
  if (!customer) return { kind: "invalid", message: "Select a valid customer" };
  if (input.driverId && !driver) return { kind: "invalid", message: "Select a valid driver" };

  const trackingCode = `FF-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const notes = input.notes?.trim() || null;

  const record = await prisma.$transaction(async (transaction) => {
    const shipment = await transaction.shipment.create({
      data: {
        trackingCode,
        origin: originBranch.city,
        destination: destinationBranch.city,
        originBranchId: originBranch.id,
        destinationBranchId: destinationBranch.id,
        customerId: customer.id,
        driverId: driver?.id ?? null,
        assignmentStatus: driver ? "PENDING" : "ACCEPTED",
        notes,
        status: "PENDING",
      },
      include: shipmentInclude,
    });

    await transaction.statusLog.create({
      data: {
        shipmentId: shipment.id,
        status: "PENDING",
        actorEmail: input.actorEmail,
        description: `Shipment created with route ${originBranch.city} to ${destinationBranch.city}`,
      },
    });

    return shipment;
  });

  return { kind: "created", shipment: toShipment(record) };
}

export async function listShipments() {
  const records = await prisma.shipment.findMany({
    include: shipmentInclude,
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toShipment);
}

export type AssignShipmentDriverResult =
  | { kind: "updated"; shipment: Shipment }
  | { kind: "not-found" }
  | { kind: "invalid-driver" };

export async function assignShipmentDriver(
  trackingCode: string,
  driverId: string | null,
  actorEmail: string,
): Promise<AssignShipmentDriverResult> {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.shipment.findFirst({
      where: { trackingCode: { equals: trackingCode.trim(), mode: "insensitive" } },
      include: shipmentInclude,
    });

    if (!current) return { kind: "not-found" };
    if (current.driverId === driverId) return { kind: "updated", shipment: toShipment(current) };

    const driver = driverId
      ? await transaction.user.findFirst({ where: { id: driverId, role: "DRIVER" }, select: { id: true, name: true } })
      : null;
    if (driverId && !driver) return { kind: "invalid-driver" };

    const updated = await transaction.shipment.update({
      where: { id: current.id },
      data: {
        driverId: driver?.id ?? null,
        assignmentStatus: driver ? "PENDING" : "ACCEPTED",
      },
      include: shipmentInclude,
    });

    await transaction.statusLog.create({
      data: {
        shipmentId: updated.id,
        status: updated.status,
        actorEmail,
        description: driver
          ? `Driver assigned: ${driver.name}; awaiting driver response`
          : "Driver unassigned",
      },
    });

    return { kind: "updated", shipment: toShipment(updated) };
  });
}

export type AssignmentResponseResult =
  | { kind: "updated"; shipment: Shipment }
  | { kind: "not-found" }
  | { kind: "forbidden" }
  | { kind: "not-pending" };

export async function respondToShipmentAssignment(
  trackingCode: string,
  assignmentStatus: Extract<AssignmentStatus, "ACCEPTED" | "REJECTED">,
  actorEmail: string,
): Promise<AssignmentResponseResult> {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.shipment.findFirst({
      where: { trackingCode: { equals: trackingCode.trim(), mode: "insensitive" } },
      include: { driver: { select: { email: true } } },
    });

    if (!current) return { kind: "not-found" };
    if (current.driver?.email.toLowerCase() !== actorEmail.toLowerCase()) {
      return { kind: "forbidden" };
    }
    if (current.assignmentStatus !== "PENDING") return { kind: "not-pending" };

    const updated = await transaction.shipment.update({
      where: { id: current.id },
      data: {
        assignmentStatus,
        ...(assignmentStatus === "REJECTED" ? { driverId: null } : {}),
      },
      include: shipmentInclude,
    });

    await transaction.statusLog.create({
      data: {
        shipmentId: updated.id,
        status: updated.status,
        actorEmail,
        description: assignmentStatus === "ACCEPTED"
          ? "Driver accepted the shipment assignment"
          : "Driver rejected the shipment assignment",
      },
    });

    return { kind: "updated", shipment: toShipment(updated) };
  });
}

export type AddShipmentNoteResult =
  | { kind: "updated"; shipment: Shipment }
  | { kind: "not-found" }
  | { kind: "forbidden" };

export async function addShipmentNote(
  trackingCode: string,
  notes: string,
  location: string | undefined,
  actor: ShipmentActor,
): Promise<AddShipmentNoteResult> {
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
    if (actor.role === "DRIVER" && current.assignmentStatus !== "ACCEPTED") {
      return { kind: "forbidden" };
    }

    const updated = await transaction.shipment.update({
      where: { id: current.id },
      data: { notes: notes.trim() },
      include: shipmentInclude,
    });

    await transaction.statusLog.create({
      data: {
        shipmentId: updated.id,
        status: updated.status,
        actorEmail: actor.email,
        location: location?.trim() || null,
        description: `Delivery note updated: ${notes.trim()}`,
      },
    });

    return { kind: "updated", shipment: toShipment(updated) };
  });
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

export async function getShipmentAlerts(now = new Date()) {
  const staleBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const where: Prisma.ShipmentWhereInput = {
    OR: [
      { status: "EXCEPTION" },
      { status: "IN_TRANSIT", updatedAt: { lt: staleBefore } },
    ],
  };

  const [count, shipments] = await Promise.all([
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where,
      take: 6,
      orderBy: [{ status: "asc" }, { updatedAt: "asc" }],
      select: {
        trackingCode: true,
        origin: true,
        destination: true,
        status: true,
        updatedAt: true,
        notes: true,
      },
    }),
  ]);

  return {
    count,
    items: shipments.map((shipment) => ({
      ...shipment,
      staleHours: Math.floor((now.getTime() - shipment.updatedAt.getTime()) / 3_600_000),
    })),
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
    if (actor.role === "DRIVER" && current.assignmentStatus !== "ACCEPTED") {
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
