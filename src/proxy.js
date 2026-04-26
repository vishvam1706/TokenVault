import { auth } from "@root/auth";
import { NextResponse } from "next/server";

/**
 * Proxy (Next.js 16 replacement for middleware):
 * Protects /dashboard and /api/accounts routes at the edge.
 * Unauthenticated requests to /dashboard are redirected to /.
 * Unauthenticated API requests get a 401 JSON response.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Protect dashboard page
  if (pathname.startsWith("/dashboard")) {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect API routes — return 401 JSON instead of redirect
  if (pathname.startsWith("/api/accounts")) {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/accounts/:path*"],
};
