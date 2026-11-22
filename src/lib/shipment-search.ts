import { statusLabels, type AssignmentStatus, type ShipmentStatus } from "./types";

export type ShipmentSearchParams = Record<string, string | string[] | undefined>;

export type ShipmentFilters = {
  q: string;
  status: string;
  route: string;
  from: string;
  to: string;
  assignment: string;
  page: number;
};

export function parseShipmentFilters(params: ShipmentSearchParams, driver = false) {
  const value = (key: string) => typeof params[key] === "string" ? params[key].trim() : "";
  const requestedPage = Number(value("page"));
  const filters: ShipmentFilters = {
    q: value("q").slice(0, 100),
    status: value("status"),
    route: value("route").slice(0, 200),
    from: driver ? "" : value("from"),
    to: driver ? "" : value("to"),
    assignment: driver ? value("assignment") : "",
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  };
  let error = "";
  if (filters.status && !Object.keys(statusLabels).includes(filters.status)) {
    error = "Choose a valid shipment status.";
  }
  if (filters.assignment && !["PENDING", "ACCEPTED", "REJECTED"].includes(filters.assignment)) {
    error = "Choose a valid assignment status.";
  }
  for (const date of [filters.from, filters.to]) {
    if (!date) continue;
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      error = "Enter a valid date.";
    }
  }
  if (filters.from && filters.to && filters.from > filters.to) {
    error = "The start date must be on or before the end date.";
  }
  return { filters, error };
}

type SearchableShipment = {
  trackingCode: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  createdAt?: string;
  assignmentStatus?: AssignmentStatus;
};

export function filterShipments<T extends SearchableShipment>(shipments: T[], filters: ShipmentFilters): T[] {
  const query = filters.q.toLowerCase();
  const route = filters.route.toLowerCase();
  return shipments.filter((shipment) => {
    const date = shipment.createdAt?.slice(0, 10) ?? "";
    return shipment.trackingCode.toLowerCase().includes(query)
      && (!filters.status || shipment.status === filters.status)
      && `${shipment.origin} ${shipment.destination}`.toLowerCase().includes(route)
      && (!filters.assignment || shipment.assignmentStatus === filters.assignment)
      && (!filters.from || date >= filters.from)
      && (!filters.to || Boolean(date && date <= filters.to));
  });
}

export function paginateShipments<T>(shipments: T[], requestedPage: number, pageSize = 6) {
  const pages = Math.max(1, Math.ceil(shipments.length / pageSize));
  const page = Math.min(pages, requestedPage);
  const offset = (page - 1) * pageSize;
  return { page, pages, offset, visible: shipments.slice(offset, offset + pageSize) };
}

export function shipmentSearchParams(filters: ShipmentFilters, page?: number) {
  const search = new URLSearchParams();
  for (const key of ["q", "status", "route", "from", "to", "assignment"] as const) {
    if (filters[key]) search.set(key, filters[key]);
  }
  if (page !== undefined) search.set("page", String(page));
  return search.toString();
}
