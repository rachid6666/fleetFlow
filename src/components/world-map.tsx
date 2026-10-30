import { activeBranches } from "@/lib/branches";

const labelOffsets: Record<string, { x: number; y: number }> = {
  MUC: { x: 14, y: -10 },
  FRA: { x: 14, y: 17 },
  PAR: { x: -38, y: -10 },
  MAD: { x: 14, y: 18 },
  NYC: { x: 14, y: -10 },
  PEK: { x: 14, y: -10 },
};

function project(latitude: number, longitude: number) {
  return { x: ((longitude + 180) / 360) * 900, y: ((90 - latitude) / 180) * 300 };
}

export function WorldMap() {
  return <div className="world-map" aria-label="FleetFlow active branch network map"><div className="world-map-canvas"><img src="/world-network-map.png" alt="Stylized world map showing FleetFlow's global logistics network" /><svg viewBox="0 0 900 300" role="img" aria-label="FleetFlow active branch locations"><path className="map-route" d="M265 82 Q360 28 456 69 T741 84" />{activeBranches.map((branch) => { const { x, y } = project(branch.latitude, branch.longitude); const offset = labelOffsets[branch.code] ?? { x: 11, y: 4 }; return <g key={branch.code} className="map-pin" transform={`translate(${x} ${y})`}><circle r="7" /><circle className="pin-pulse" r="13" /><g className="map-label" transform={`translate(${offset.x} ${offset.y})`}><rect x="-4" y="-11" width="38" height="18" rx="9" /><text x="5" y="2">{branch.code}</text></g></g>; })}</svg></div><div className="map-caption"><span className="online-dot" /> 6 active branches · Europe, North America & East Asia</div></div>;
}
