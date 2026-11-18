import assert from "node:assert/strict";
import test from "node:test";
import { customerShipmentsCsv, filterShipments, paginateShipments, parseShipmentFilters, shipmentSearchParams } from "../src/lib/shipment-search";
import type { CustomerShipment } from "../src/lib/types";

function shipment(index: number): CustomerShipment {
  return {
    id: String(index), trackingCode: `FF-${index}`, origin: "Munich", destination: "Paris",
    status: "IN_TRANSIT", createdAt: "2026-11-18T23:59:59.999Z",
    updatedAt: "Just now", eta: "Not scheduled", events: [],
  };
}

test("customer filters combine and include the entire final UTC day", () => {
  const records = [shipment(1), { ...shipment(2), createdAt: "2026-11-19T00:00:00.000Z" }];
  const { filters, error } = parseShipmentFilters({ q: " ff- ", status: "IN_TRANSIT", route: "PARIS", from: "2026-11-18", to: "2026-11-18" });
  assert.equal(error, "");
  assert.deepEqual(filterShipments(records, filters).map((row) => row.id), ["1"]);
  assert.equal(filterShipments(records, { ...filters, status: "DELIVERED" }).length, 0);
});

test("invalid dates, inverted ranges, and unsupported statuses are rejected", () => {
  for (const params of [{ from: "2026-02-30" }, { from: "2026-99-01" }, { from: "tomorrow" }, { from: "2026-11-19", to: "2026-11-18" }, { status: "__proto__" }]) {
    assert.ok(parseShipmentFilters(params).error);
  }
});

test("driver filters find pending assignments without requiring customer date fields", () => {
  const records = [
    { ...shipment(1), assignmentStatus: "PENDING" as const },
    { ...shipment(2), assignmentStatus: "ACCEPTED" as const },
  ];
  const { filters, error } = parseShipmentFilters({ assignment: "PENDING", route: "munich", from: "invalid" }, true);
  assert.equal(error, "");
  assert.deepEqual(filterShipments(records, filters).map((row) => row.id), ["1"]);
  assert.ok(parseShipmentFilters({ assignment: "INVALID" }, true).error);
});

test("pagination clamps stale pages and retains every filter in navigation", () => {
  const records = Array.from({ length: 8 }, (_, index) => shipment(index));
  const { filters } = parseShipmentFilters({ q: "FF", route: "Paris", status: "IN_TRANSIT", page: "999" });
  const result = paginateShipments(filterShipments(records, filters), filters.page);
  assert.equal(result.page, 2);
  assert.equal(result.offset, 6);
  assert.equal(result.visible.length, 2);
  const params = new URLSearchParams(shipmentSearchParams(filters, 1));
  assert.equal(params.get("route"), "Paris");
  assert.equal(params.get("status"), "IN_TRANSIT");
  assert.equal(params.get("q"), "FF");
  assert.equal(params.get("page"), "1");
  assert.equal(new URLSearchParams(shipmentSearchParams(filters)).has("page"), false);
  assert.equal(paginateShipments([], 99).page, 1);
  for (const page of ["-1", "NaN", "1.5", "Infinity", "99999999999999999999"]) {
    assert.equal(parseShipmentFilters({ page }).filters.page, 1);
  }
});

test("CSV exports all matching pages and only approved customer fields", () => {
  const records = Array.from({ length: 8 }, (_, index) => ({ ...shipment(index), notes: "INTERNAL_SECRET", driverName: "PRIVATE_DRIVER" }));
  const csv = customerShipmentsCsv(records);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.equal(csv.trimEnd().split("\r\n").length, 9);
  assert.ok(csv.includes('"FF-7"'));
  assert.equal(csv.includes("INTERNAL_SECRET"), false);
  assert.equal(csv.includes("PRIVATE_DRIVER"), false);
});

test("CSV quotes commas and newlines and neutralizes formula prefixes", () => {
  const record = { ...shipment(1), origin: 'Munich, "Hub"\nSouth', destination: " =HYPERLINK(1)" };
  const csv = customerShipmentsCsv([record]);
  assert.ok(csv.includes('"Munich, ""Hub""\nSouth"'));
  assert.ok(csv.includes('"\' =HYPERLINK(1)"'));
  for (const origin of ["+1", "-2", "@SUM(1)", "\t=SUM(1)", "\r=1", "\n=1"]) {
    assert.ok(customerShipmentsCsv([{ ...record, origin }]).includes(`"'${origin}"`));
  }
});
