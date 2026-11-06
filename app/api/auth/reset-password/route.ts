import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, validateRequestOrigin } from "@/lib/security";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 10000;

/**
 * POST /api/auth/reset-password
 *
 * Server-side proxy to the backend's POST /auth/reset-password.
 *
 * Same reason as its sibling /api/auth/forgot-password: `connect-src 'self'`
 * in vercel.json blocks direct calls to the backend origin, so a reset link
 * would fail in the browser before any request left the page.
 *
 * Unauthenticated by necessity - the caller is someone who cannot log in. The
 * token itself is the credential, and the backend burns it on use.
 */
export async function POST(req: NextRequest) {
  const originCheck = validateRequestOrigin(req);
  if (!originCheck.valid) {
    return NextResponse.json(
      { error: originCheck.reason || "Request origin not allowed" },
      { status: 403 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rl = checkRateLimit(`${ip}:/auth/reset-password`, {
    limit: 10,
    windowSeconds: 300,
    prefix: "reset",
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("[reset-password] backend fetch failed:", (err as Error).message);
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable." },
      { status: 503 }
    );
  }

  const payload = (await upstream.json().catch(() => null)) as
    | { error?: string; ok?: boolean; [key: string]: unknown }
    | null;

  if (!upstream.ok) {
    if (upstream.status >= 500) {
      console.error(`[reset-password] backend returned ${upstream.status}`);
      return NextResponse.json(
        { error: "Password reset is temporarily unavailable." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: payload?.error ?? "Could not reset the password." },
      { status: upstream.status }
    );
  }

  return NextResponse.json(payload ?? { ok: true }, { status: upstream.status });
}
