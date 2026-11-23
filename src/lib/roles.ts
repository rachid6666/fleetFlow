import type { Route } from "next";

export type AppRole = "ADMIN" | "SALES" | "DRIVER" | "CUSTOMER";

export function workspacePathForRole(role: AppRole): Route {
  if (role === "ADMIN") return "/admin" as Route;
  if (role === "SALES") return "/sales" as Route;
  if (role === "DRIVER") return "/driver" as Route;
  return "/customer" as Route;
}

export function workspaceLabelForRole(role: AppRole) {
  if (role === "ADMIN") return "CEO PANEL";
  if (role === "SALES") return "SALES WORKSPACE";
  if (role === "DRIVER") return "DRIVER WORKSPACE";
  return "CUSTOMER PORTAL";
}
