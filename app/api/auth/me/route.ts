import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/sessionCookie";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

/**
 * Returns the caller's own account as the backend sees it.
 *
 * The identity must come from the backend, never from what the browser holds:
 * a customer can rewrite `sessionStorage` and claim any role or `isInternal`
 * flag they like. Only the value read from the `User` row counts, and this is
 * the route that reports it.
 *
 * The backend authenticates with `Authorization: Bearer` and nothing else - it
 * does not read cookies. Previously this route forwarded the cookie header
 * through, which the backend ignored, so after a page reload the caller's
 * in-memory token was gone and this call failed even though a valid session
 * cookie was sitting right there in the request. Translating the cookie into
 * the header the backend actually accepts is what makes a reload survive.
 */
export async function GET(request: NextRequest) {
  const token = readSessionToken(request);

  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const body = await res.text();

    // Pass the backend's verdict through untouched, including its failures. A
    // 401 from the backend means the session is genuinely no longer valid, and
    // the guard above this must be free to see that and act on it.
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[auth/me] backend unreachable:", (error as Error).message);
    return NextResponse.json(
      { error: "Backend unreachable. Please try again later." },
      { status: 502 }
    );
  }
}
