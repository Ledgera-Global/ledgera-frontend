import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, validateRequestOrigin } from "@/lib/security";
import { readSessionToken } from "@/lib/sessionCookie";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 15000;

/**
 * POST /api/contracts/firma/send
 *
 * Server-side proxy to the backend's POST /contracts/firma/send.
 *
 * This route exists because the browser cannot call the backend directly:
 * `connect-src` in vercel.json is `'self'`, so any fetch to the Railway origin
 * is blocked by CSP before it leaves the page. Widening connect-src to the
 * whole API origin would let any injected script talk to the backend with the
 * user's cookie, so instead the browser talks to its own origin and this route
 * performs the call server-side.
 *
 * AUTHORITY: this route does not decide who the user is. It forwards the
 * caller's own session token as `Authorization: Bearer`, exactly as
 * lib/backendProxy does, and the backend's `authenticate` +
 * `requireCompanyIdInBodyMatchAuth("companyId")` still decide whether the token
 * is valid and whether it may act for the `companyId` in the body. The body is
 * forwarded unmodified so that check cannot be bypassed here.
 *
 * Firma sends are slow (PDF render plus an upstream signing request), so the
 * timeout is longer than the 4s used by read paths, and a timeout is reported
 * as 504 rather than being collapsed into a generic 500.
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
  const rl = checkRateLimit(`${ip}:/contracts/firma/send`, {
    limit: 10,
    windowSeconds: 60,
    prefix: "firma",
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many contract requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const userToken = readSessionToken(req);
  if (!userToken) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/contracts/firma/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const isTimeout = (err as Error)?.name === "TimeoutError";
    console.error(
      `[firma/send] backend ${isTimeout ? "timed out" : "unreachable"}:`,
      (err as Error).message
    );
    return NextResponse.json(
      {
        error: isTimeout
          ? "The signing service did not respond in time. Please try again."
          : "The signing service is unavailable.",
      },
      { status: isTimeout ? 504 : 502 }
    );
  }

  const payload = (await upstream.json().catch(() => null)) as
    | { error?: string; message?: string; [key: string]: unknown }
    | null;

  if (!upstream.ok) {
    // 4xx is the backend's own judgement (bad body, tenant mismatch, bad token)
    // and its `error` text is written to be read. 5xx is not: it stays generic.
    if (upstream.status >= 500) {
      console.error(`[firma/send] backend returned ${upstream.status}`);
      return NextResponse.json(
        { error: "Failed to send the document. Please contact support." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: payload?.error ?? "Request refused" },
      { status: upstream.status }
    );
  }

  if (payload === null) {
    return NextResponse.json(
      { error: "The signing service returned an unreadable response." },
      { status: 502 }
    );
  }

  return NextResponse.json(payload, { status: upstream.status });
}
