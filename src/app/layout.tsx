import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FleetFlow · Logistics operations",
  description: "Shipment tracking, driver assignments, and delivery auditability.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
