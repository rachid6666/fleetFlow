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
  { code: "ALG", name: "Algiers Hub", city: "Algiers", country: "Algeria", region: "North Africa", latitude: 36.7538, longitude: 3.0588, isActive: true, volume: "1,240 shipments" },
  { code: "ORN", name: "Oran Gateway", city: "Oran", country: "Algeria", region: "North Africa", latitude: 35.6971, longitude: -0.6308, isActive: true, volume: "860 shipments" },
  { code: "TUN", name: "Tunis Partner Hub", city: "Tunis", country: "Tunisia", region: "North Africa", latitude: 36.8065, longitude: 10.1815, isActive: true, volume: "420 shipments" },
  { code: "CAS", name: "Casablanca Gateway", city: "Casablanca", country: "Morocco", region: "North Africa", latitude: 33.5731, longitude: -7.5898, isActive: true, volume: "530 shipments" },
  { code: "MAD", name: "Madrid Relay", city: "Madrid", country: "Spain", region: "Europe", latitude: 40.4168, longitude: -3.7038, isActive: true, volume: "210 shipments" },
];
