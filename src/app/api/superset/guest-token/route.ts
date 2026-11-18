import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });

  const baseUrl = process.env.SUPERSET_SERVER_URL || process.env.SUPERSET_URL;
  const dashboardId = new URL(request.url).searchParams.get("dashboard") === "analytics"
    ? process.env.SUPERSET_ANALYTICS_DASHBOARD_ID
    : process.env.SUPERSET_DASHBOARD_ID;
  const username = process.env.SUPERSET_USERNAME;
  const password = process.env.SUPERSET_PASSWORD;
  if (!baseUrl || !dashboardId || !username || !password) {
    return NextResponse.json({ error: "Superset is not configured" }, { status: 503 });
  }

  try {
  const loginResponse = await fetch(`${baseUrl}/api/v1/security/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password, provider: "db", refresh: false }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!loginResponse.ok) return NextResponse.json({ error: "Superset service authentication failed" }, { status: 502 });
  const login = (await loginResponse.json()) as { access_token?: string };
  if (!login.access_token) return NextResponse.json({ error: "Superset did not return an access token" }, { status: 502 });

  const csrfResponse = await fetch(`${baseUrl}/api/v1/security/csrf_token/`, {
    headers: { Authorization: `Bearer ${login.access_token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!csrfResponse.ok) return NextResponse.json({ error: "Superset CSRF token request failed" }, { status: 502 });
  const csrf = (await csrfResponse.json()) as { result?: string };
  const sessionCookie = csrfResponse.headers.get("set-cookie")?.split(";", 1)[0];
  if (!csrf.result || !sessionCookie) return NextResponse.json({ error: "Superset did not establish a CSRF session" }, { status: 502 });

  const guestResponse = await fetch(`${baseUrl}/api/v1/security/guest_token/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${login.access_token}`,
      "X-CSRFToken": csrf.result,
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      resources: [{ type: "dashboard", id: dashboardId }],
      rls: [],
      user: { username: "fleetflow-admin-viewer", first_name: "FleetFlow", last_name: "Admin" },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!guestResponse.ok) return NextResponse.json({ error: "Superset guest token request failed" }, { status: 502 });
  const guest = (await guestResponse.json()) as { token?: string };
  if (!guest.token) return NextResponse.json({ error: "Superset did not return a guest token" }, { status: 502 });
  return NextResponse.json({ token: guest.token }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Superset is unavailable" }, { status: 502 });
  }
}
