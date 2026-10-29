import { NextResponse } from "next/server";
import { auth } from "../auth";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const role = request.auth?.user?.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login?error=admin", request.url));
  }

  if (pathname.startsWith("/driver") && role !== "ADMIN" && role !== "DRIVER") {
    return NextResponse.redirect(new URL("/login?error=driver", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*"],
};
