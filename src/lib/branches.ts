export type Branch = {
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  volume: string;
};

export const activeBranches: Branch[] = [
  { code: "MUC", name: "Munich Hub", city: "Munich", country: "Germany", region: "Europe", latitude: 48.1351, longitude: 11.582, isActive: true, volume: "920 shipments" },
  { code: "FRA", name: "Frankfurt Gateway", city: "Frankfurt", country: "Germany", region: "Europe", latitude: 50.1109, longitude: 8.6821, isActive: true, volume: "1,180 shipments" },
  { code: "PAR", name: "Paris Relay", city: "Paris", country: "France", region: "Europe", latitude: 48.8566, longitude: 2.3522, isActive: true, volume: "1,040 shipments" },
  { code: "MAD", name: "Madrid Relay", city: "Madrid", country: "Spain", region: "Europe", latitude: 40.4168, longitude: -3.7038, isActive: true, volume: "760 shipments" },
  { code: "NYC", name: "New York Gateway", city: "New York", country: "United States", region: "North America", latitude: 40.7128, longitude: -74.006, isActive: true, volume: "1,360 shipments" },
  { code: "PEK", name: "Beijing Gateway", city: "Beijing", country: "China", region: "East Asia", latitude: 39.9042, longitude: 116.4074, isActive: true, volume: "1,510 shipments" },
];
