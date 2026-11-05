import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, validateRequestOrigin } from "@/lib/security";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 10000;

/**
 * POST /api/auth/forgot-password
 *
 * Server-side proxy to the backend's POST /auth/forgot-password.
 *
 * The page used to call the backend origin directly, which `connect-src 'self'`
 * in vercel.json blocks - so the reset button always failed with a network
 * error before any request was sent.
 *
 * This is an unauthenticated endpoint: the caller is by definition someone who
 * cannot log in. It is rate-limited far more tightly than an authenticated
 * route because it triggers an outbound email, which makes it a spam and
 * address-enumeration target.
 *
 * The backend already answers identically whether or not the address exists
 * ("If an account exists..."), and this proxy does not add anything that would
 * distinguish the two - it forwards the status and body verbatim.
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
  const rl = checkRateLimit(`${ip}:/auth/forgot-password`, {
    limit: 5,
    windowSeconds: 300,
    prefix: "forgot",
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many reset requests. Please try again in a few minutes." },
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
    upstream = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("[forgot-password] backend fetch failed:", (err as Error).message);
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable." },
      { status: 503 }
    );
  }

  const payload = (await upstream.json().catch(() => null)) as
    | { error?: string; message?: string; [key: string]: unknown }
    | null;

  if (!upstream.ok) {
    if (upstream.status >= 500) {
      console.error(`[forgot-password] backend returned ${upstream.status}`);
      return NextResponse.json(
        { error: "Password reset is temporarily unavailable." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: payload?.error ?? "Could not send the reset email" },
      { status: upstream.status }
    );
  }

  return NextResponse.json(payload ?? { ok: true }, { status: upstream.status });
}
