import { NextRequest, NextResponse } from "next/server";

/**
 * Security middleware that applies protection headers to all responses.
 *
 * For Vercel-deployed apps, vercel.json handles the primary headers.
 * This middleware ensures headers are also applied during local development
 * and on any deployment that doesn't process vercel.json.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers (defence-in-depth alongside vercel.json)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Prevent search engines from indexing API routes
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/health")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

/**
 * Only apply middleware to routes that need it.
 * Static files, images, and Next.js internals are skipped.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/ (public assets like file.svg, globe.svg)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
