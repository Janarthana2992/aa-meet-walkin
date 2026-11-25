import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/server/auth/session";

/**
 * Route protection.
 * - admin role: everything under /admin and /api/admin
 * - desk role (volunteer PIN): /checkin plus the read-only lookups it needs
 */
const DESK_API_READ_PATTERNS = [
  /^\/api\/admin\/registrations$/,
  /^\/api\/admin\/events\/\d+\/pre-registrations$/,
];

function isDeskAllowed(req: NextRequest): boolean {
  const { pathname } = req.nextUrl;
  if (pathname === "/checkin" || pathname.startsWith("/checkin/")) return true;
  if (req.method !== "GET") return false;
  return DESK_API_READ_PATTERNS.some((re) => re.test(pathname));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  let session = null;
  try {
    session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  } catch (err) {
    console.error("Session verification failed:", err);
  }

  const allowed =
    session?.role === "admin" || (session?.role === "desk" && isDeskAllowed(req));

  if (allowed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        success: false,
        error: session ? "You do not have access to this action." : "Please sign in.",
      },
      { status: session ? 403 : 401 }
    );
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/checkin/:path*", "/checkin"],
};
