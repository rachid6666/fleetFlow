import { auth } from "../../../../../../auth";
import { listShipmentsForCustomer } from "@/lib/data";
import { customerShipmentsCsv, filterShipments, parseShipmentFilters } from "@/lib/shipment-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (user.role !== "CUSTOMER" || !user.email) {
    return Response.json({ error: "Customer access required" }, { status: 403 });
  }
  const { filters, error } = parseShipmentFilters(Object.fromEntries(new URL(request.url).searchParams));
  if (error) return Response.json({ error }, { status: 400 });
  const shipments = await listShipmentsForCustomer(user.email);
  const csv = customerShipmentsCsv(filterShipments(shipments, filters));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fleetflow-shipments.csv"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
