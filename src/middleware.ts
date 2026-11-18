import { NextResponse } from "next/server";
import { auth } from "../auth";
import { workspacePathForRole } from "./lib/roles";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const user = request.auth?.user;

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const workspace = workspacePathForRole(user.role);

  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL(workspace, request.url));
  }
  if (pathname.startsWith("/driver") && user.role !== "DRIVER") {
    return NextResponse.redirect(new URL(workspace, request.url));
  }
  if ((pathname.startsWith("/customer") || pathname.startsWith("/track")) && user.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL(workspace, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/workspace", "/admin/:path*", "/driver/:path*", "/customer/:path*", "/track"],
};
