import type { FeatureCollection } from "geojson";
import type { StyleSpecification } from "maplibre-gl";
import usStatesData from "@/data/us-states.json";
import worldCountriesData from "@/data/world-countries.json";

export const MAPCN_WORKER_URL = "/maplibre-gl-worker.mjs";

export const US_STATES_DATA = usStatesData as unknown as FeatureCollection;
export const WORLD_COUNTRIES_DATA = worldCountriesData as unknown as FeatureCollection;

export const MAPCN_STREET_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export const MAPCN_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#06120c" },
    },
  ],
};

