import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const issuer = (process.env.AUTHENTIK_ISSUER ?? "http://localhost:9000/application/o/fleetflow/")
    .replace("host.docker.internal", "localhost")
    .replace(/\/$/, "");
  const origin = new URL(request.url).origin;
  const authentikOrigin = new URL(issuer).origin;
  const logoutUrl =
    `${authentikOrigin}/if/flow/default-invalidation-flow/?next=${encodeURIComponent(`${origin}/login`)}`;

  const response = NextResponse.redirect(logoutUrl);
  const cookiesToClear = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.callback-url",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "authjs.pkce.code_verifier",
    "authjs.state",
    "authjs.nonce",
  ];

  for (const name of cookiesToClear) {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
