import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { getShipmentByTrackingCode } from "@/lib/data";
import { statusLabels } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const code = (await searchParams).code?.trim() ?? "";
  const shipment = code ? await getShipmentByTrackingCode(code) : undefined;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main simple-page">
        <div className="topbar">
          <div>
            <div className="eyebrow">Customer tracking</div>
            <h1>Where is your shipment?</h1>
            <p className="subtitle">Enter a tracking code to see the latest verified events.</p>
          </div>
        </div>
        <section className="panel">
          <form className="tracking-form">
            <input
              name="code"
              defaultValue={code}
              placeholder="e.g. FF-2048-AL"
              aria-label="Tracking code"
            />
            <button className="button">Track shipment</button>
          </form>
          {shipment ? (
            <>
              <div className="panel-heading">
                <div>
                  <h2>{shipment.trackingCode}</h2>
                  <p className="subtitle">
                    {shipment.origin} → {shipment.destination} · ETA {shipment.eta}
                  </p>
                </div>
                <StatusBadge status={shipment.status} />
              </div>
              <div className="timeline">
                {shipment.events.map((event) => (
                  <div className="timeline-item" key={`${event.status}-${event.createdAt}`}>
                    <div className="timeline-rail" />
                    <div>
                      <time>{new Date(event.createdAt).toLocaleString()}</time>
                      <h3>{statusLabels[event.status]}</h3>
                      <p>{event.description}</p>
                    </div>
                  </div>
                ))}
                {shipment.events.length === 0 ? <p>No tracking events have been recorded yet.</p> : null}
              </div>
            </>
          ) : code ? (
            <p className="subtitle">
              No shipment found for <strong>{code}</strong>. Check the code and try again.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
