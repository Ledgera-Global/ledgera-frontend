import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "./sessionCookie";

import {
  applySecurityHeaders,
  checkRateLimit,
  isTokenVerifierConfigured,
  validateRequestOrigin,
  verifyApiToken,
} from "./security";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
// If the backend (e.g. Railway hobby tier) is cold-starting or down, fail fast rather
// than letting pages hang on a slow/unbounded fetch.
const BACKEND_FETCH_TIMEOUT_MS = 4000;

/**
 * Header used to make the provenance of every proxied response explicit.
 * "live" = data came from the backend; "demo" = bundled fixture data.
 * This exists so a silent fallback can never again be mistaken for real data.
 */
const DATA_SOURCE_HEADER = "X-Ledgera-Data-Source";

/**
 * Extracts the user's session token from the incoming Next.js request.
 *
 * Delegates to the shared resolver so this proxy and the workspace proxy cannot
 * disagree about where a session token lives. That disagreement was the bug:
 * both looked for a cookie nothing ever wrote, so the workspace answered 401
 * while this proxy silently served demo fixtures to signed-in customers.
 */
export function extractUserSessionToken(req: NextRequest): string | null {
  return readSessionToken(req);
}

/**
 * Validates that the requesting user has access to the specified companyId.
 * Users can only access their own company's data.
 */
function isCompanyAccessAuthorized(
  userCompanyId: string | undefined,
  requestedCompanyId: string
): boolean {
  if (!userCompanyId) return false;
  return userCompanyId === requestedCompanyId;
}

/**
 * Fetch data from the Express backend.
 *
 * The caller's own validated session token is forwarded verbatim. The backend
 * verifies that token against the real user record (existence, `disabled`,
 * `tokenVersion`) and derives the tenant from it. The frontend never mints a
 * replacement identity for the user.
 */
export async function fetchFromBackend<T>(path: string, bearerToken: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend fetch failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Handle a proxied API GET request.
 *
 * SECURITY: Validates the requesting user's JWT and ensures they can only
 * access their own company's data.
 *
 * DATA INTEGRITY: An authenticated caller is never served demo data. If the
 * backend is unreachable the request fails loudly (502) instead of quietly
 * substituting fixtures, because presenting fabricated financial figures to a
 * logged-in customer is worse than showing an error. Demo data is returned only
 * to unauthenticated callers, purely as a public product preview.
 */
export async function handleApiGet<T>(
  req: NextRequest,
  params: { companyId: string },
  backendPath: string,
  demoData: T
): Promise<NextResponse<T | { error: string }>> {
  const { companyId } = params;
  const headers = new Headers();
  applySecurityHeaders(headers);

  // ── Rate limiting ───────────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rl = checkRateLimit(`${ip}:${backendPath}`, {
    limit: 60,
    windowSeconds: 15,
    prefix: "proxy",
  });
  if (!rl.allowed) {
    headers.set("Retry-After", String(Math.ceil((rl.resetAt - Date.now()) / 1000)));
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
  }

  // ── Origin validation for CSRF protection ───────────────────────────
  const originCheck = validateRequestOrigin(req);
  if (!originCheck.valid && req.method !== "GET") {
    return NextResponse.json(
      { error: originCheck.reason || "Request origin not allowed" },
      { status: 403, headers }
    );
  }

  // ── Validate the user's session token and companyId access ──────────
  //    This prevents privilege escalation: user A cannot request company B's data.
  const userToken = extractUserSessionToken(req);

  if (userToken) {
    // This check is a first pass, not the authority: the backend re-verifies
    // the same token against the live user record on every request. It only
    // runs when this deployment actually holds the shared secret. Without
    // JWT_SECRET we cannot tell a forged token from a legitimate one, and
    // refusing the caller would sign every customer out of their own
    // dashboard - so we defer to the backend, which still refuses anything it
    // does not accept. The company check is likewise only meaningful when the
    // token's own company is decodable.
    if (isTokenVerifierConfigured()) {
      const tokenValidation = verifyApiToken(userToken);
      if (!tokenValidation.valid) {
        return NextResponse.json(
          { error: "Invalid or expired session" },
          { status: 401, headers }
        );
      }

      if (
        tokenValidation.companyId &&
        !isCompanyAccessAuthorized(tokenValidation.companyId, companyId)
      ) {
        return NextResponse.json(
          { error: "Forbidden: you do not have access to this company's data" },
          { status: 403, headers }
        );
      }
    }
  } else {
    // Unauthenticated preview: serve fixtures, clearly labelled as such.
    headers.set(DATA_SOURCE_HEADER, "demo");
    return NextResponse.json(demoData, { headers });
  }

  // ── Authenticated: fetch real data, or fail loudly ──────────────────
  try {
    const data = await fetchFromBackend<T>(backendPath, userToken as string);
    headers.set(DATA_SOURCE_HEADER, "live");
    return NextResponse.json(data, { headers });
  } catch (err) {
    console.error(`[backendProxy] ${backendPath} failed:`, (err as Error).message);
    return NextResponse.json(
      { error: "Upstream data temporarily unavailable" },
      { status: 502, headers }
    );
  }
}

/**
 * Handle a proxied POST/PUT/DELETE request with body.
 * Includes the same security checks as handleApiGet.
 */
export async function handleApiMutation<T>(
  req: NextRequest,
  params: { companyId: string },
  backendPath: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST"
): Promise<NextResponse<T | { error: string }>> {
  const { companyId } = params;
  const headers = new Headers();
  applySecurityHeaders(headers);

  // ── Rate limiting (stricter for mutations) ──────────────────────────
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rl = checkRateLimit(`${ip}:${backendPath}`, {
    limit: 20,
    windowSeconds: 15,
    prefix: "mutation",
  });
  if (!rl.allowed) {
    headers.set("Retry-After", String(Math.ceil((rl.resetAt - Date.now()) / 1000)));
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
  }

  // ── Origin validation (enforced for all mutations) ──────────────────
  const originCheck = validateRequestOrigin(req);
  if (!originCheck.valid) {
    return NextResponse.json(
      { error: originCheck.reason || "Request origin not allowed" },
      { status: 403, headers }
    );
  }

  // ── Token validation (mutations always require authentication) ──────
  const userToken = extractUserSessionToken(req);
  if (!userToken) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });
  }

  // Same reasoning as the GET path: a token must always be present, but the
  // local signature check only runs when this deployment can perform it. The
  // backend remains the gate that actually decides.
  if (isTokenVerifierConfigured()) {
    const tokenValidation = verifyApiToken(userToken);
    if (!tokenValidation.valid) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401, headers });
    }

    if (
      tokenValidation.companyId &&
      !isCompanyAccessAuthorized(tokenValidation.companyId, companyId)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
    }
  }

  // ── Execute mutation, forwarding the caller's own token ─────────────
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const res = await fetch(`${BACKEND_URL}${backendPath}`, {
      method,
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Backend mutation failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as T;
    headers.set(DATA_SOURCE_HEADER, "live");
    return NextResponse.json(data, { status: res.status, headers });
  } catch (err) {
    console.error(`[backendProxy] ${method} ${backendPath} failed:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers });
  }
}
/**
 * Handle a proxied Server-Sent Events request.
 *
 * This exists because `handleApiGet` cannot serve a stream: it buffers the
 * upstream body into JSON and applies a 4-second timeout, both of which would
 * break an event stream that is meant to stay open for up to half an hour.
 *
 * It is deliberately still part of this module rather than a standalone route
 * helper, so that "where does the session token come from" and "who is allowed
 * to read this company" have exactly one answer in this codebase.
 *
 * No timeout is applied to the upstream fetch. The backend closes the stream
 * itself after its maximum lifetime, and the caller's own abort signal is
 * forwarded so a browser that navigates away tears the upstream connection down
 * immediately rather than leaving it running until the next write fails.
 *
 * Unauthenticated callers are refused rather than served a fixture. A demo
 * event stream that never produces events would be indistinguishable from a
 * real one that is simply quiet, which is precisely the confusion this whole
 * layer is built to avoid.
 */
export async function handleApiStream(
  req: NextRequest,
  params: { companyId: string },
  backendPath: string
): Promise<Response> {
  const { companyId } = params;
  const headers = new Headers();
  applySecurityHeaders(headers);

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  // Streams are limited far more tightly than reads: each one holds a database
  // cursor and a subscription on the backend, so a reconnect loop is expensive
  // in a way a repeated GET is not.
  const rl = checkRateLimit(`${ip}:${backendPath}`, {
    limit: 20,
    windowSeconds: 900,
    prefix: "stream",
  });
  if (!rl.allowed) {
    headers.set("Retry-After", String(Math.ceil((rl.resetAt - Date.now()) / 1000)));
    return NextResponse.json({ error: "Too many stream connections" }, { status: 429, headers });
  }

  const userToken = extractUserSessionToken(req);
  if (!userToken) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });
  }

  // As on the other paths, this check only runs when the deployment holds the
  // shared secret; the backend still verifies the token against the live user
  // record and derives the tenant from it.
  if (isTokenVerifierConfigured()) {
    const tokenValidation = verifyApiToken(userToken);
    if (!tokenValidation.valid) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401, headers });
    }
    if (
      tokenValidation.companyId &&
      !isCompanyAccessAuthorized(tokenValidation.companyId, companyId)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "text/event-stream",
      },
      cache: "no-store",
      signal: req.signal,
    });
  } catch (err) {
    console.error(`[backendProxy] stream ${backendPath} failed:`, (err as Error).message);
    return NextResponse.json(
      { error: "Live stream temporarily unavailable" },
      { status: 502, headers }
    );
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Live stream unavailable", status: upstream.status },
      { status: 502, headers }
    );
  }

  const streamHeaders = new Headers(headers);
  streamHeaders.set("Content-Type", "text/event-stream");
  streamHeaders.set("Cache-Control", "no-cache, no-transform");
  streamHeaders.set("Connection", "keep-alive");
  // Tells any intermediary not to buffer, which would defeat the point of SSE.
  streamHeaders.set("X-Accel-Buffering", "no");
  streamHeaders.set(DATA_SOURCE_HEADER, "live");

  return new Response(upstream.body, { status: 200, headers: streamHeaders });
}
