import { NextRequest, NextResponse } from "next/server";
import { resolveBackendUrl } from "../../../../lib/backendUrl";

const BACKEND_FETCH_TIMEOUT_MS = 10000;

/**
 * POST /api/auth/login
 *
 * Server-side proxy to the backend's POST /auth/login.
 *
 * The page calls this route rather than the backend origin because
 * `connect-src 'self'` in vercel.json blocks direct cross-origin calls.
 *
 * The upstream call is bounded. Before this, the fetch had no timeout, so when
 * the backend was slow or down the request hung until the hosting platform
 * killed it and the user received a bare platform error after fifteen seconds
 * with no explanation. Every other auth proxy in this app already bound its
 * call; login was the exception, which is the worst place for it to be - this
 * is the one request a locked-out user cannot work around.
 *
 * Failure handling distinguishes three different situations, because they need
 * three different responses:
 *   - the backend answered and refused (401 bad password, 403 disabled
 *     account): forward its status and message verbatim, so the user is told
 *     what is actually wrong;
 *   - the backend answered but with a server error: report that the service is
 *     unavailable rather than blaming the credentials;
 *   - the backend did not answer at all (timeout, DNS, connection refused):
 *     503, so the client can tell "try again shortly" from "wrong password".
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Resolved per request, not at module load: a missing or loopback value must
  // produce one clear response, not break the route for every caller.
  const backendUrl = resolveBackendUrl();

  let upstream: Response;
  try {
    upstream = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("[auth/login] backend fetch failed:", (err as Error).message);
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  // The backend's error bodies are JSON, but a proxy or platform error page is
  // not. Reading defensively keeps a non-JSON reply from being mistaken for an
  // unreachable backend and reported as the wrong problem.
  const payload = (await upstream.json().catch(() => null)) as
    | { error?: string; token?: string; [key: string]: unknown }
    | null;

  if (!upstream.ok) {
    if (upstream.status >= 500) {
      console.error(`[auth/login] backend returned ${upstream.status}`);
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable. Please try again shortly." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: payload?.error ?? "Sign-in failed." },
      { status: upstream.status }
    );
  }

  if (payload === null) {
    console.error("[auth/login] backend returned an unreadable body");
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json(payload, { status: upstream.status });
}
