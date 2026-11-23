import type { Route } from "next";

export type AppRole = "ADMIN" | "DRIVER" | "CUSTOMER";

export function workspacePathForRole(role: AppRole): Route {
  if (role === "ADMIN") return "/admin" as Route;
  if (role === "DRIVER") return "/driver" as Route;
  return "/customer" as Route;
}

export function workspaceLabelForRole(role: AppRole) {
  if (role === "ADMIN") return "CEO PANEL";
  if (role === "DRIVER") return "DRIVER WORKSPACE";
  return "CUSTOMER PORTAL";
}
