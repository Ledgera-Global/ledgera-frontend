import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 6000;

/**
 * Proxy to the backend's POST /auth/set-password.
 * Accepts the one-time invite token + new password; the backend validates the
 * token (purpose=invite) and updates the user's password. No auth header needed
 * — this is the unauthenticated "claim your account" step for invitees.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    console.error("[set-password] backend fetch failed:", (err as Error).message);
    return NextResponse.json({ error: "Password setup unavailable" }, { status: 503 });
  }
}
