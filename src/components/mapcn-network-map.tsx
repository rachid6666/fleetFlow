"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
} from "maplibre-gl";
import { MAPCN_MAP_STYLE, MAPCN_WORKER_URL, WORLD_COUNTRIES_DATA } from "@/components/mapcn-map-config";
import { WorldMap } from "@/components/world-map";
import type { FacilityMapLocation } from "@/lib/types";

const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-175, -58],
  [175, 82],
];
const US_CLUSTER_CENTER: [number, number] = [-98.5, 38.5];

type MapLibreModule = typeof import("maplibre-gl");

function createFacilityMarker(location: FacilityMapLocation, onSelect: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mapcn-marker";
  button.setAttribute(
    "aria-label",
    `${location.city}, ${location.state}. ${location.facilityCount} facilities and ${location.dockDoors} dock doors. ${location.facilityTypes.join(", ")}.`,
  );
  button.title = `${location.city}, ${location.state} · ${location.facilityCount} facilities`;

  const pulse = document.createElement("span");
  pulse.className = "mapcn-marker-pulse";
  pulse.setAttribute("aria-hidden", "true");

  const dot = document.createElement("span");
  dot.className = "mapcn-marker-dot";
  dot.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "mapcn-marker-label";
  label.textContent = location.state;
  label.setAttribute("aria-hidden", "true");

  button.append(pulse, dot, label);
  button.addEventListener("click", onSelect);
  return button;
}

export function MapcnNetworkMap({
  locations,
  locationsAvailable,
}: {
  locations: FacilityMapLocation[];
  locationsAvailable: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const [showCities, setShowCities] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLocation = locations.find((location) => location.id === selectedId) ?? null;
  const totalFacilities = locations.reduce((total, location) => total + location.facilityCount, 0);

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;

    async function initializeMap() {
      try {
        const maplibre: MapLibreModule = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;

        if (!maplibre.getWorkerUrl()) maplibre.setWorkerUrl(MAPCN_WORKER_URL);

        map = new maplibre.Map({
          container: containerRef.current,
          style: MAPCN_MAP_STYLE,
          center: [8, 22],
          zoom: 1.1,
          minZoom: 0.6,
          maxZoom: 8,
          renderWorldCopies: true,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          attributionControl: false,
        });

        map.addControl(
          new maplibre.AttributionControl({
            compact: true,
            customAttribution: "Natural Earth boundaries · Facility data from Neon",
          }),
          "bottom-right",
        );

        map.once("load", () => {
          if (cancelled || !map) return;

          map.setPaintProperty("background", "background-color", "#111716");
          map.addSource("world-countries", {
            type: "geojson",
            data: structuredClone(WORLD_COUNTRIES_DATA),
          });
          map.addLayer({
            id: "world-country-fill",
            type: "fill",
            source: "world-countries",
            paint: {
              "fill-color": "#4c5550",
              "fill-opacity": 0.86,
            },
          });
          map.addLayer({
            id: "world-country-borders",
            type: "line",
            source: "world-countries",
            paint: {
              "line-color": "#7f8984",
              "line-opacity": 0.52,
              "line-width": 0.65,
            },
          });

          const nextMap = map;
          markersRef.current = locations.map((location) => {
            return new maplibre.Marker({
              element: createFacilityMarker(location, () => setSelectedId(location.id)),
              anchor: "center",
            })
              .setLngLat([location.longitude, location.latitude])
              .addTo(nextMap);
          });

          const updateMarkerVisibility = () => {
            const showCities = nextMap.getZoom() >= 2.15;
            for (const marker of markersRef.current) {
              marker.getElement()?.classList.toggle("is-hidden", !showCities);
            }
            setShowCities(showCities);
          };

          updateMarkerVisibility();
          nextMap.on("zoom", updateMarkerVisibility);
          nextMap.fitBounds(WORLD_BOUNDS, {
            padding: { top: 24, right: 28, bottom: 28, left: 28 },
            duration: 0,
          });

          mapRef.current = nextMap;
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
      map?.remove();
    };
  }, [locations, totalFacilities]);

  function zoomIn() {
    mapRef.current?.zoomIn({ duration: 280 });
  }

  function zoomOut() {
    mapRef.current?.zoomOut({ duration: 280 });
  }

  function resetView() {
    setSelectedId(null);
    mapRef.current?.fitBounds(WORLD_BOUNDS, {
      padding: { top: 24, right: 28, bottom: 28, left: 28 },
      duration: 650,
    });
  }

  async function toggleFullscreen() {
    const element = shellRef.current;
    if (!element) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await element.requestFullscreen();
  }

  if (failed) return <WorldMap />;

  return (
    <div
      ref={shellRef}
      className="mapcn-network-map"
      role="region"
      aria-label="FleetFlow interactive global facility map"
    >
      <div ref={containerRef} className="mapcn-map-canvas" />
      <div className="mapcn-map-tint" aria-hidden="true" />

{locations.length && !showCities ? (
        <button
          type="button"
          className="mapcn-world-cluster mapcn-world-cluster-overlay"
          onClick={() => mapRef.current?.flyTo({ center: US_CLUSTER_CENTER, zoom: 3.15, duration: 750 })}
          aria-label={`${totalFacilities} U.S. facilities across ${locations.length} cities. Zoom in to view city locations.`}
        >
          <span className="mapcn-world-cluster-ring" aria-hidden="true" />
          <strong>{totalFacilities}</strong>
          <span>US facilities</span>
        </button>
      ) : null}

      <div className="mapcn-map-label">
        <span className="online-dot" />
        <span>Global facility network</span>
      </div>

      {selectedLocation ? (
        <div className="mapcn-branch-popover" role="status" aria-live="polite">
          <button
            type="button"
            className="mapcn-popover-close"
            onClick={() => setSelectedId(null)}
            aria-label="Close facility location details"
          >
            <X aria-hidden="true" />
          </button>
          <span className="mapcn-popover-code">{selectedLocation.state}</span>
          <strong>{selectedLocation.city}</strong>
          <span>{selectedLocation.facilityCount} {selectedLocation.facilityCount === 1 ? "facility" : "facilities"}</span>
          <small>{selectedLocation.dockDoors} dock doors · {selectedLocation.facilityTypes.join(", ")}</small>
        </div>
      ) : null}

      {!locationsAvailable || !locations.length ? (
        <div className="mapcn-empty-state" role="status">
          <strong>{locationsAvailable ? "No mapped facilities found" : "Facility locations unavailable"}</strong>
          <span>{locationsAvailable ? "The logistics database has no facility coordinates to display." : "FleetFlow could not load facility data from Neon."}</span>
        </div>
      ) : null}

      <div className="mapcn-controls" aria-label="Map controls">
        <button type="button" onClick={zoomIn} aria-label="Zoom map in" disabled={!ready}>
          <Plus aria-hidden="true" />
        </button>
        <button type="button" onClick={zoomOut} aria-label="Zoom map out" disabled={!ready}>
          <Minus aria-hidden="true" />
        </button>
        <button type="button" onClick={resetView} aria-label="Reset map to global facility view" disabled={!ready}>
          <RotateCcw aria-hidden="true" />
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label="Toggle map fullscreen">
          <Maximize2 aria-hidden="true" />
        </button>
      </div>

      {!ready ? (
        <div className="mapcn-loader" role="status" aria-live="polite">
          <span />
          <span />
          <span />
          <span className="sr-only">Loading global facility map</span>
        </div>
      ) : null}

      <div className="mapcn-map-legend">
        <span className="mapcn-legend-dot" aria-hidden="true" />
        {locations.length ? `${totalFacilities} facilities · ${locations.length} U.S. cities` : "No mapped facilities"}
      </div>
    </div>
  );
}
