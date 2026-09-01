import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 6000;

function extractSessionToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
  return req.cookies.get("ledgera_token")?.value ?? null;
}

/**
 * Proxy to the backend's admin-gated /admin/team.
 * The backend enforces that the caller has an admin/internal role; this route
 * only forwards the caller's session token. No demo fallback.
 */
export async function POST(req: NextRequest) {
  const token = extractSessionToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/team`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin/team] backend fetch failed:", (err as Error).message);
    return NextResponse.json({ error: "Team service unavailable" }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  const token = extractSessionToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND_URL}/admin/team`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin/team] backend fetch failed:", (err as Error).message);
    return NextResponse.json({ error: "Team service unavailable" }, { status: 503 });
  }
}
