import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const path = request.nextUrl.pathname;

  // Not logged in → block all dashboards
  if (!token && (path.startsWith("/adminDashboard") || path.startsWith("/learnerDashboard"))) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Admin trying to access learner dashboard
  if (role === "admin" && path.startsWith("/learnerDashboard")) {
    return NextResponse.redirect(new URL("/adminDashboard", request.url));
  }

  // Learner trying to access admin dashboard
  if (role === "learner" && path.startsWith("/adminDashboard")) {
    return NextResponse.redirect(new URL("/learnerDashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/adminDashboard/:path*", "/learnerDashboard/:path*"],
};