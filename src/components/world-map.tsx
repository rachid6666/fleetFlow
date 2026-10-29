import { activeBranches } from "@/lib/branches";

export function WorldMap() {
  return <div className="world-map" aria-label="FleetFlow active branch network map"><div className="world-map-canvas"><img src="/world-network-map.png" alt="Stylized world map showing FleetFlow's global logistics network" /><svg viewBox="0 0 900 300" role="img" aria-label="FleetFlow active branch locations"><path className="map-route" d="M438 174 Q480 148 510 174 T574 154" />{activeBranches.map((branch) => { const x = 450 + branch.longitude * 3.2; const y = 205 - (branch.latitude - 30) * 4.8; return <g key={branch.code} className="map-pin" transform={`translate(${x} ${y})`}><circle r="7" /><circle className="pin-pulse" r="13" /><text x="11" y="4">{branch.code}</text></g>; })}</svg></div><div className="map-caption"><span className="online-dot" /> 5 active branches · North Africa & Europe</div></div>;
}
