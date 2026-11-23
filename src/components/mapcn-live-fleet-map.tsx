"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import type {
  GeoJSONSource,
  LngLatBounds as MapLibreBounds,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
} from "maplibre-gl";
import type { Feature, FeatureCollection, LineString } from "geojson";
import { MAPCN_STREET_STYLE, MAPCN_WORKER_URL } from "@/components/mapcn-map-config";
import type { LiveShipment } from "@/lib/types";

const ATTENTION_COLORS = {
  "on-track": "#2df49a",
  stale: "#ffb454",
  exception: "#ff776f",
  completed: "#69aaff",
} as const;

type TrailProperties = {
  id: string;
  trackingCode: string;
  attention: LiveShipment["attention"];
  selected: boolean;
};

function buildTrailData(
  shipments: LiveShipment[],
  selectedCode: string,
): FeatureCollection<LineString, TrailProperties> {
  const features: Array<Feature<LineString, TrailProperties>> = [];

  for (const shipment of shipments) {
    const coordinates: [number, number][] = [];
    if (shipment.originPoint) coordinates.push([shipment.originPoint.longitude, shipment.originPoint.latitude]);
    for (const point of shipment.trail) coordinates.push([point.longitude, point.latitude]);
    if (shipment.destinationPoint) coordinates.push([shipment.destinationPoint.longitude, shipment.destinationPoint.latitude]);
    if (coordinates.length < 2) continue;

    features.push({
      type: "Feature",
      properties: {
        id: shipment.id,
        trackingCode: shipment.trackingCode,
        attention: shipment.attention,
        selected: shipment.trackingCode === selectedCode,
      },
      geometry: { type: "LineString", coordinates },
    });
  }

  return { type: "FeatureCollection", features };
}

function createShipmentMarker(
  shipment: LiveShipment,
  selected: boolean,
  onSelect: (trackingCode: string) => void,
) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `mapcn-live-marker is-${shipment.attention}${selected ? " is-selected" : ""}`;
  button.style.setProperty("--shipment-color", ATTENTION_COLORS[shipment.attention]);
  button.setAttribute("aria-pressed", String(selected));
  button.setAttribute(
    "aria-label",
    `${shipment.trackingCode}, ${shipment.origin} to ${shipment.destination}, ${shipment.progressPercent}% complete`,
  );
  button.title = `${shipment.trackingCode} · ${shipment.progressPercent}% complete`;

  const pulse = document.createElement("span");
  pulse.className = "mapcn-live-marker-pulse";
  pulse.setAttribute("aria-hidden", "true");

  const dot = document.createElement("span");
  dot.className = "mapcn-live-marker-dot";
  dot.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "mapcn-live-marker-label";
  label.textContent = shipment.trackingCode;
  label.setAttribute("aria-hidden", "true");

  button.append(pulse, dot, label);
  button.addEventListener("click", () => onSelect(shipment.trackingCode));
  return button;
}

export function MapcnLiveFleetMap({
  shipments,
  selectedCode,
  onSelect,
}: {
  shipments: LiveShipment[];
  selectedCode: string;
  onSelect: (trackingCode: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const maplibreRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const boundsRef = useRef<MapLibreBounds | null>(null);
  const hasFitRef = useRef(false);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mapZoom, setMapZoom] = useState(2.2);

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;

    async function initializeMap() {
      try {
        const maplibre = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;

        if (!maplibre.getWorkerUrl()) maplibre.setWorkerUrl(MAPCN_WORKER_URL);

        map = new maplibre.Map({
          container: containerRef.current,
          style: MAPCN_STREET_STYLE,
          center: [-98.5, 38.5],
          zoom: 2.2,
          minZoom: 1,
          maxZoom: 18,
          renderWorldCopies: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          attributionControl: false,
        });

        map.addControl(
          new maplibre.AttributionControl({
            compact: true,
            customAttribution: "GPS data from Neon",
          }),
          "bottom-right",
        );

        map.on("zoom", () => setMapZoom(map?.getZoom() ?? 2.2));

        map.once("load", () => {
          if (cancelled || !map) return;

          map.addSource("shipment-trails", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "shipment-route-glow",
            type: "line",
            source: "shipment-trails",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": ["match", ["get", "attention"], "on-track", ATTENTION_COLORS["on-track"], "stale", ATTENTION_COLORS.stale, "exception", ATTENTION_COLORS.exception, "completed", ATTENTION_COLORS.completed, ATTENTION_COLORS["on-track"]],
              "line-width": ["case", ["get", "selected"], 16, 11],
              "line-opacity": 0.28,
              "line-blur": 2,
            },
          });
          map.addLayer({
            id: "shipment-routes",
            type: "line",
            source: "shipment-trails",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": ["match", ["get", "attention"], "on-track", ATTENTION_COLORS["on-track"], "stale", ATTENTION_COLORS.stale, "exception", ATTENTION_COLORS.exception, "completed", ATTENTION_COLORS.completed, ATTENTION_COLORS["on-track"]],
              "line-width": ["case", ["get", "selected"], 6, 4],
              "line-opacity": ["case", ["get", "selected"], 1, 0.82],
            },
          });

          mapRef.current = map;
          maplibreRef.current = maplibre;
          setReady(true);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      for (const marker of markersRef.current) marker.remove();
      markersRef.current = [];
      mapRef.current = null;
      maplibreRef.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!ready || !map || !maplibre) return;

    const source = map.getSource("shipment-trails") as GeoJSONSource | undefined;
    source?.setData(buildTrailData(shipments, selectedCode));

    for (const marker of markersRef.current) marker.remove();
    markersRef.current = shipments.map((shipment) => {
      return new maplibre.Marker({
        element: createShipmentMarker(shipment, shipment.trackingCode === selectedCode, (trackingCode) => {
          selectRef.current(trackingCode);
        }),
        anchor: "center",
      })
        .setLngLat([shipment.latestPoint.longitude, shipment.latestPoint.latitude])
        .addTo(map);
    });

    if (!hasFitRef.current && shipments.length) {
      const bounds = new maplibre.LngLatBounds();
      for (const shipment of shipments) {
        if (shipment.originPoint) bounds.extend([shipment.originPoint.longitude, shipment.originPoint.latitude]);
        for (const point of shipment.trail) bounds.extend([point.longitude, point.latitude]);
        if (shipment.destinationPoint) bounds.extend([shipment.destinationPoint.longitude, shipment.destinationPoint.latitude]);
      }
      boundsRef.current = bounds;
      map.fitBounds(bounds, {
        padding: { top: 38, right: 52, bottom: 42, left: 38 },
        maxZoom: 5.2,
        duration: 0,
      });
      hasFitRef.current = true;
    }
  }, [ready, shipments, selectedCode]);

  function zoomIn() {
    const map = mapRef.current;
    if (map) map.zoomTo(Math.min(18, map.getZoom() + 2), { duration: 300 });
  }

  function zoomOut() {
    const map = mapRef.current;
    if (map) map.zoomTo(Math.max(1, map.getZoom() - 2), { duration: 300 });
  }

  function resetView() {
    if (boundsRef.current) {
      mapRef.current?.fitBounds(boundsRef.current, {
        padding: { top: 38, right: 52, bottom: 42, left: 38 },
        maxZoom: 5.2,
        duration: 650,
      });
    }
  }

  async function toggleFullscreen() {
    const element = shellRef.current;
    if (!element) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await element.requestFullscreen();
  }

  return (
    <div ref={shellRef} className="mapcn-live-map" role="region" aria-label="Live shipment GPS map with city roads">
      <div ref={containerRef} className="mapcn-live-map-canvas" />
      <div className="mapcn-live-map-label">
        <span className="online-dot" />
        <span>Live U.S. routes · street zoom</span>
      </div>

      <div className="mapcn-live-zoom-level" aria-live="polite">Z {mapZoom.toFixed(1)}</div>

      <div className="mapcn-controls mapcn-live-controls" aria-label="Live map controls">
        <button type="button" onClick={zoomIn} aria-label="Zoom live map in" disabled={!ready || mapZoom >= 18}>
          <Plus aria-hidden="true" />
        </button>
        <button type="button" onClick={zoomOut} aria-label="Zoom live map out" disabled={!ready || mapZoom <= 1}>
          <Minus aria-hidden="true" />
        </button>
        <button type="button" onClick={resetView} aria-label="Fit all live shipment routes" disabled={!ready}>
          <RotateCcw aria-hidden="true" />
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label="Toggle live map fullscreen">
          <Maximize2 aria-hidden="true" />
        </button>
      </div>

      {!ready && !failed ? (
        <div className="mapcn-loader" role="status" aria-live="polite">
          <span />
          <span />
          <span />
          <span className="sr-only">Loading live street map</span>
        </div>
      ) : null}

      {!shipments.length ? (
        <div className="mapcn-live-empty" role="status">
          <strong>No stored GPS routes</strong>
          <span>Live shipment pings will appear here when Neon returns tracking data.</span>
        </div>
      ) : null}

      {failed ? (
        <div className="mapcn-live-empty is-error" role="alert">
          <strong>Street map unavailable</strong>
          <span>The live GPS shipment data remains available in FleetMonitor.</span>
        </div>
      ) : null}
    </div>
  );
}

