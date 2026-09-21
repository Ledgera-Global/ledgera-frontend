import { NextRequest, NextResponse } from "next/server";

import {
  applySecurityHeaders,
  checkRateLimit,
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
 * Checks the Authorization header first, then falls back to the session cookie.
 */
export function extractUserSessionToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  const cookieToken = req.cookies.get("ledgera_token")?.value;
  if (cookieToken) return cookieToken;

  return null;
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
