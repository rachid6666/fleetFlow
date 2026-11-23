import { Prisma, type AssignmentStatus, type DriverAvailability, type PaymentMethod, type ShipmentStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { syncAuthentikDirectoryUsers } from "./authentik-directory";
import { assertTransition } from "./shipment-rules";
import { prisma } from "./prisma";
import type { AppRole } from "./roles";
import type { CustomerShipment, FacilityMapLocation, Shipment, ShipmentEvent } from "./types";

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
  locations: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    dockDoors: number;
  }>;
  drivers: Array<{ id: string; name: string; email: string }>;
  customers: Array<{ id: string; name: string; email: string }>;
};

export type DriverAvailabilityRecord = {
  id: string;
  name: string;
  email: string;
  availability: DriverAvailability;
};

export async function getDriverByEmail(email: string): Promise<DriverAvailabilityRecord | null> {
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, role: "DRIVER" },
    select: { id: true, name: true, email: true, availability: true },
  });
}

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
  originFacilityId: string;
  destinationFacilityId: string;
  customerId: string;
  driverId?: string | null;
  chargeAmount?: number | null;
  notes?: string;
  actorEmail: string;
};

export type CreateShipmentResult =
  | { kind: "created"; shipment: Shipment }
  | { kind: "invalid"; message: string };

export async function getShipmentFormOptions(): Promise<ShipmentFormOptions> {
  const [facilities, directoryUsers] = await Promise.all([
    prisma.kaggleFacility.findMany({
      orderBy: [{ state: "asc" }, { city: "asc" }, { facilityName: "asc" }],
      select: {
        facilityId: true,
        facilityName: true,
        city: true,
        state: true,
        dockDoors: true,
      },
    }),
    syncAuthentikDirectoryUsers(),
  ]);

  return {
    locations: facilities.map((facility) => ({
      id: facility.facilityId,
      name: facility.facilityName,
      city: facility.city,
      state: facility.state,
      dockDoors: facility.dockDoors,
    })),
    drivers: directoryUsers
      .filter((user) => user.role === "DRIVER")
      .map((user) => ({ id: user.id, name: user.name, email: user.email })),
    customers: directoryUsers
      .filter((user) => user.role === "CUSTOMER")
      .map((user) => ({ id: user.id, name: user.name, email: user.email })),
  };
}

export type PaymentLedgerStatus = "PAID" | "PARTIAL" | "UNPAID" | "RECORDED" | "NO_CHARGE";

export type PaymentLedgerItem = {
  shipmentId: string;
  trackingCode: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  customerName: string;
  chargeAmount: number | null;
  collectedAmount: number;
  balanceAmount: number | null;
  paymentStatus: PaymentLedgerStatus;
  lastPaymentAt: string | null;
};

export type PaymentLedger = {
  items: PaymentLedgerItem[];
  summary: {
    totalCharged: number;
    totalCollected: number;
    totalOutstanding: number;
    unpaidShipments: number;
  };
};

function paymentStatusFor(charge: Prisma.Decimal | null, collected: Prisma.Decimal): PaymentLedgerStatus {
  if (!charge) return collected.greaterThan(0) ? "RECORDED" : "NO_CHARGE";
  if (collected.greaterThanOrEqualTo(charge)) return "PAID";
  return collected.greaterThan(0) ? "PARTIAL" : "UNPAID";
}

export async function getPaymentLedger(): Promise<PaymentLedger> {
  const records = await prisma.shipment.findMany({
    include: {
      customer: { select: { name: true } },
      payments: {
        orderBy: { receivedAt: "desc" },
        select: { amount: true, receivedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = records.map((record): PaymentLedgerItem => {
    const collected = record.payments.reduce(
      (sum, payment) => sum.plus(payment.amount),
      new Prisma.Decimal(0),
    );
    const rawBalance = record.chargeAmount?.minus(collected) ?? null;
    const balance = rawBalance?.lessThan(0) ? new Prisma.Decimal(0) : rawBalance;

    return {
      shipmentId: record.id,
      trackingCode: record.trackingCode,
      origin: record.origin,
      destination: record.destination,
      status: record.status,
      customerName: record.customer.name,
      chargeAmount: record.chargeAmount?.toNumber() ?? null,
      collectedAmount: collected.toNumber(),
      balanceAmount: balance?.toNumber() ?? null,
      paymentStatus: paymentStatusFor(record.chargeAmount, collected),
      lastPaymentAt: record.payments[0]?.receivedAt.toISOString() ?? null,
    };
  });

  const totals = records.reduce(
    (summary, record) => {
      const collected = record.payments.reduce(
        (sum, payment) => sum.plus(payment.amount),
        new Prisma.Decimal(0),
      );
      const rawBalance = record.chargeAmount?.minus(collected) ?? null;
      const balance = rawBalance?.greaterThan(0) ? rawBalance : new Prisma.Decimal(0);
      const paymentStatus = paymentStatusFor(record.chargeAmount, collected);

      return {
        charged: summary.charged.plus(record.chargeAmount ?? 0),
        collected: summary.collected.plus(collected),
        outstanding: summary.outstanding.plus(balance),
        unpaidShipments:
          summary.unpaidShipments + (paymentStatus !== "PAID" && paymentStatus !== "NO_CHARGE" ? 1 : 0),
      };
    },
    {
      charged: new Prisma.Decimal(0),
      collected: new Prisma.Decimal(0),
      outstanding: new Prisma.Decimal(0),
      unpaidShipments: 0,
    },
  );

  return {
    items,
    summary: {
      totalCharged: totals.charged.toNumber(),
      totalCollected: totals.collected.toNumber(),
      totalOutstanding: totals.outstanding.toNumber(),
      unpaidShipments: totals.unpaidShipments,
    },
  };
}

export type RecordShipmentPaymentInput = {
  shipmentId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  actorEmail: string;
};

export type RecordShipmentPaymentResult =
  | {
      kind: "created";
      payment: {
        id: string;
        shipmentId: string;
        amount: number;
        currency: string;
        method: PaymentMethod;
        receivedAt: string;
      };
    }
  | { kind: "not-found" }
  | { kind: "invalid"; message: string };

export async function recordShipmentPayment(
  input: RecordShipmentPaymentInput,
): Promise<RecordShipmentPaymentResult> {
  const amount = new Prisma.Decimal(input.amount);
  if (!amount.isPositive()) return { kind: "invalid", message: "Payment amount must be greater than zero" };

  const shipment = await prisma.shipment.findUnique({
    where: { id: input.shipmentId },
    select: {
      id: true,
      chargeAmount: true,
      payments: { select: { amount: true } },
    },
  });
  if (!shipment) return { kind: "not-found" };

  if (shipment.chargeAmount) {
    const alreadyPaid = shipment.payments.reduce(
      (sum, payment) => sum.plus(payment.amount),
      new Prisma.Decimal(0),
    );
    const balance = shipment.chargeAmount.minus(alreadyPaid);
    if (amount.greaterThan(balance)) {
      return {
        kind: "invalid",
        message: `Payment exceeds the remaining balance of ${balance.toFixed(2)} USD`,
      };
    }
  }

  const payment = await prisma.shipmentPayment.create({
    data: {
      shipmentId: shipment.id,
      amount,
      currency: "USD",
      method: input.method,
      reference: input.reference?.trim() || null,
      recordedByEmail: input.actorEmail,
    },
  });

  return {
    kind: "created",
    payment: {
      id: payment.id,
      shipmentId: payment.shipmentId,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      method: payment.method,
      receivedAt: payment.receivedAt.toISOString(),
    },
  };
}

export async function createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
  const [originLocation, destinationLocation, customer, driver] = await Promise.all([
    prisma.kaggleFacility.findUnique({ where: { facilityId: input.originFacilityId } }),
    prisma.kaggleFacility.findUnique({ where: { facilityId: input.destinationFacilityId } }),
    prisma.user.findFirst({ where: { id: input.customerId, role: "CUSTOMER" } }),
    input.driverId
      ? prisma.user.findFirst({ where: { id: input.driverId, role: "DRIVER" } })
      : Promise.resolve(null),
  ]);

  if (!originLocation) return { kind: "invalid", message: "Select a valid origin storage location" };
  if (!destinationLocation) return { kind: "invalid", message: "Select a valid destination storage location" };
  if (originLocation.facilityId === destinationLocation.facilityId) {
    return { kind: "invalid", message: "Origin and destination must be different storage locations" };
  }
  if (!customer) return { kind: "invalid", message: "Select a valid customer" };
  if (input.driverId && !driver) return { kind: "invalid", message: "Select a valid driver" };

  const trackingCode = `FF-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const notes = input.notes?.trim() || null;
  const origin = `${originLocation.city}, ${originLocation.state}`;
  const destination = `${destinationLocation.city}, ${destinationLocation.state}`;

  const record = await prisma.$transaction(async (transaction) => {
    const shipment = await transaction.shipment.create({
      data: {
        trackingCode,
        origin,
        destination,
        originLatitude: originLocation.latitude,
        originLongitude: originLocation.longitude,
        destinationLatitude: destinationLocation.latitude,
        destinationLongitude: destinationLocation.longitude,
        originFacilityId: originLocation.facilityId,
        destinationFacilityId: destinationLocation.facilityId,
        customerId: customer.id,
        driverId: driver?.id ?? null,
        assignmentStatus: driver ? "PENDING" : "ACCEPTED",
        chargeAmount: input.chargeAmount == null ? null : new Prisma.Decimal(input.chargeAmount),
        notes,
        status: "PENDING",
        locationPings: {
          create: {
            latitude: originLocation.latitude,
            longitude: originLocation.longitude,
            speedMph: 0,
            headingDegrees: null,
            recordedAt: new Date(),
            source: "shipment-created",
          },
        },
      },
      include: shipmentInclude,
    });

    await transaction.statusLog.create({
      data: {
        shipmentId: shipment.id,
        status: "PENDING",
        actorEmail: input.actorEmail,
        description: `Shipment created from ${originLocation.facilityName} to ${destinationLocation.facilityName}`,
      },
    });

    return shipment;
  }, { maxWait: 10_000, timeout: 20_000 });

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

function customerUpdateDescription(status: ShipmentStatus) {
  if (status === "PENDING") return "Shipment booked";
  if (status === "DISPATCHED") return "Shipment dispatched";
  if (status === "IN_TRANSIT") return "Shipment in transit";
  if (status === "DELIVERED") return "Shipment delivered";
  return "Shipment requires attention";
}

const customerShipmentSelect = {
  createdAt: true,
  id: true,
  trackingCode: true,
  origin: true,
  destination: true,
  status: true,
  updatedAt: true,
  updates: {
    orderBy: { createdAt: "desc" },
    select: { status: true, createdAt: true },
  },
} satisfies Prisma.ShipmentSelect;

type CustomerShipmentRecord = Prisma.ShipmentGetPayload<{ select: typeof customerShipmentSelect }>;

function toCustomerShipment(record: CustomerShipmentRecord): CustomerShipment {
  return {
    createdAt: record.createdAt.toISOString(),
    id: record.id,
    trackingCode: record.trackingCode,
    origin: record.origin,
    destination: record.destination,
    status: record.status,
    eta: formatEta(record.status),
    updatedAt: formatUpdatedAt(record.updatedAt),
    events: record.updates.map((event) => ({
      status: event.status,
      description: customerUpdateDescription(event.status),
      createdAt: event.createdAt.toISOString(),
    })),
  };
}

export async function listShipmentsForCustomer(email: string): Promise<CustomerShipment[]> {
  const records = await prisma.shipment.findMany({
    where: { customer: { email: { equals: email, mode: "insensitive" } } },
    select: customerShipmentSelect,
    orderBy: { updatedAt: "desc" },
  });
  return records.map(toCustomerShipment);
}

export async function getShipmentForCustomer(
  email: string,
  trackingCode: string,
): Promise<CustomerShipment | undefined> {
  const code = trackingCode.trim();
  if (!code) return undefined;

  const record = await prisma.shipment.findFirst({
    where: {
      trackingCode: { equals: code, mode: "insensitive" },
      customer: { email: { equals: email, mode: "insensitive" } },
    },
    select: customerShipmentSelect,
  });

  return record ? toCustomerShipment(record) : undefined;
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

export async function getFacilityMapLocations(): Promise<FacilityMapLocation[]> {
  const facilities = await prisma.kaggleFacility.findMany({
    where: {
      latitude: { gte: 18, lte: 72 },
      longitude: { gte: -180, lte: -65 },
    },
    select: {
      facilityName: true,
      facilityType: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      dockDoors: true,
    },
    orderBy: [{ state: "asc" }, { city: "asc" }, { facilityName: "asc" }],
  });

  const locations = new Map<string, FacilityMapLocation>();

  for (const facility of facilities) {
    const id = `${facility.state}-${facility.city}`;
    const existing = locations.get(id);
    if (existing) {
      existing.facilityCount += 1;
      existing.dockDoors += facility.dockDoors;
      if (!existing.facilityTypes.includes(facility.facilityType)) {
        existing.facilityTypes.push(facility.facilityType);
      }
      continue;
    }

    locations.set(id, {
      id,
      city: facility.city,
      state: facility.state,
      latitude: Number(facility.latitude),
      longitude: Number(facility.longitude),
      facilityCount: 1,
      dockDoors: facility.dockDoors,
      facilityTypes: [facility.facilityType],
    });
  }

  return [...locations.values()].sort(
    (a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city),
  );
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

export async function getShipmentForActor(
  code: string,
  actor: { role: AppRole; email?: string | null },
) {
  const where: Prisma.ShipmentWhereInput = {
    trackingCode: { equals: code.trim(), mode: "insensitive" },
  };

  if (actor.role !== "ADMIN" && actor.role !== "SALES") {
    if (!actor.email) return undefined;
    if (actor.role === "CUSTOMER") {
      where.customer = { email: { equals: actor.email, mode: "insensitive" } };
    } else {
      where.driver = { email: { equals: actor.email, mode: "insensitive" } };
    }
  }

  const shipment = await prisma.shipment.findFirst({
    where,
    select: {
      trackingCode: true,
      origin: true,
      destination: true,
      status: true,
      updates: {
        orderBy: { createdAt: "desc" },
        select: { status: true, description: true, createdAt: true },
      },
    },
  });

  if (!shipment) return undefined;

  const events: ShipmentEvent[] = shipment.updates.map((event) => ({
    status: event.status,
    description: actor.role === "CUSTOMER" ? customerUpdateDescription(event.status) : event.description,
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
