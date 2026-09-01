import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 6000;

function extractSessionToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
  return req.cookies.get("ledgera_token")?.value ?? null;
}

/**
 * Secure proxy to the backend's staff-gated GET /internal/ledgera-console.
 *
 * SECURITY: This route intentionally has NO demo-data fallback. It forwards the
 * caller's own session token; the backend enforces that the caller's role is an
 * internal role (ceo/exec/staff/etc.). Unauthenticated or non-internal callers
 * get the backend's 401/403 — they must never receive Ledgera's internal data.
 */
export async function GET(req: NextRequest) {
  const token = extractSessionToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/internal/ledgera-console`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });

    const body = await res.text();
    const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
    return new NextResponse(body, { status: res.status, headers });
  } catch (err) {
    console.error("[internal-console] backend fetch failed:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal console unavailable" },
      { status: 503 }
    );
  }
}
