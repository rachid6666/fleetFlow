import { statusLabels } from "@/lib/types";
import { shipmentSearchParams, type ShipmentFilters } from "@/lib/shipment-search";

export function ShipmentFilterForm({ filters, driver = false }: { filters: ShipmentFilters; driver?: boolean }) {
  const action = driver ? "/driver" : "/customer";
  return (
    <form className="panel shipment-filters" action={action} method="get">
      <label>Tracking code<input name="q" defaultValue={filters.q} maxLength={100} type="search" /></label>
      <label>Status<select name="status" defaultValue={filters.status}>
        <option value="">All statuses</option>
        {Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
      </select></label>
      <label>Route<input name="route" defaultValue={filters.route} maxLength={200} placeholder="Origin or destination" /></label>
      {driver ? (
        <label>Assignment<select name="assignment" defaultValue={filters.assignment}>
          <option value="">All assignments</option>
          <option value="PENDING">Awaiting acceptance</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select></label>
      ) : (
        <>
          <label>Created from (UTC)<input type="date" name="from" defaultValue={filters.from} /></label>
          <label>Created through (UTC)<input type="date" name="to" defaultValue={filters.to} min={filters.from || undefined} /></label>
        </>
      )}
      <button className="button" type="submit">Search</button>
      <a className="button secondary" href={action}>Clear filters</a>
    </form>
  );
}

export function ShipmentPagination({ filters, page, pages, driver = false }: {
  filters: ShipmentFilters; page: number; pages: number; driver?: boolean;
}) {
  const path = driver ? "/driver" : "/customer";
  return (
    <nav className="shipment-pagination" aria-label="Shipment pages">
      {page > 1 ? <a className="button secondary" href={`${path}?${shipmentSearchParams(filters, page - 1)}`}>Previous</a> : <span aria-disabled="true">Previous</span>}
      <span aria-current="page">Page {page} of {pages}</span>
      {page < pages ? <a className="button secondary" href={`${path}?${shipmentSearchParams(filters, page + 1)}`}>Next</a> : <span aria-disabled="true">Next</span>}
    </nav>
  );
}
