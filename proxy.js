import { auth } from "./auth";
import { NextResponse } from "next/server";

/**
 * Route protection proxy.
 * - Protects /dashboard and all sub-paths.
 * - Unauthenticated users are redirected to the login page (/).
 * - Auth logic is also enforced inside each API route handler
 *   (defense-in-depth — never rely solely on this layer).
 */
export async function proxy(request) {
  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL("/", request.url);
    // Preserve the original destination so we can redirect after login if needed
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
