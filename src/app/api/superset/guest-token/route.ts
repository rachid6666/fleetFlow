import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const baseUrl = process.env.SUPERSET_URL;
  const dashboardId = process.env.SUPERSET_DASHBOARD_ID;
  const username = process.env.SUPERSET_USERNAME;
  const password = process.env.SUPERSET_PASSWORD;
  if (!baseUrl || !dashboardId || !username || !password) {
    return NextResponse.json({ error: "Superset is not configured" }, { status: 503 });
  }

  const loginResponse = await fetch(`${baseUrl}/api/v1/security/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password, provider: "db", refresh: false }),
    cache: "no-store",
  });
  if (!loginResponse.ok) return NextResponse.json({ error: "Superset service authentication failed" }, { status: 502 });
  const login = (await loginResponse.json()) as { access_token?: string };
  if (!login.access_token) return NextResponse.json({ error: "Superset did not return an access token" }, { status: 502 });

  const guestResponse = await fetch(`${baseUrl}/api/v1/security/guest_token/`, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${login.access_token}` },
    body: JSON.stringify({ resources: [{ type: "dashboard", id: dashboardId }], rls: [], user: { username: session.user.email ?? "fleetflow-user", first_name: session.user.name ?? "FleetFlow", last_name: "User" } }),
    cache: "no-store",
  });
  if (!guestResponse.ok) return NextResponse.json({ error: "Superset guest token request failed" }, { status: 502 });
  const guest = (await guestResponse.json()) as { token?: string };
  return NextResponse.json({ token: guest.token });
}
