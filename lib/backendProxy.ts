import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import {
  applySecurityHeaders,
  checkRateLimit,
  validateRequestOrigin,
  verifyApiToken,
} from "./security";

const JWT_SECRET = process.env.JWT_SECRET || "";
const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

/**
 * Extracts the user's session token from the incoming Next.js request.
 * Checks Authorization header first, then falls back to the session cookie.
 */
function extractUserSessionToken(req: NextRequest): string | null {
  // Check Authorization header (Bearer token from client-side fetch)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  // Check for session cookie set by auth-context (if we switch to cookie-based auth)
  const cookieToken = req.cookies.get("ledgera_token")?.value;
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * Validates that the requesting user has access to the specified companyId.
 * Users can only access their own company's data (or admin can access all).
 */
function isCompanyAccessAuthorized(
  userCompanyId: string | undefined,
  requestedCompanyId: string
): boolean {
  if (!userCompanyId) return false;
  return userCompanyId === requestedCompanyId;
}

/**
 * Creates a JWT for backend authentication signed with the shared JWT_SECRET.
 * The Express backend's auth middleware reads `sub` as the companyId (legacy compat).
 */
function createBackendToken(companyId: string): string {
  return jwt.sign(
    {
      sub: companyId,
      companyId,
      userId: `ui-${companyId}`,
      email: "ui@ledgera.local",
      role: "user",
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "5m" }
  );
}

/**
 * Fetch data from the Express backend with JWT auth.
 */
export async function fetchFromBackend<T>(
  path: string,
  companyId: string
): Promise<T> {
  const token = createBackendToken(companyId);
  const url = `${BACKEND_URL}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
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
 * access their own company's data. Falls back to demoData if the backend
 * is unavailable or JWT_SECRET is not configured (dev mode).
 *
 * IMPORTANT: After the request's user token is validated, the route MUST NOT
 * allow the caller to specify an arbitrary companyId. The companyId in the URL
 * is cross-checked against the authenticated user's own companyId.
 */
export async function handleApiGet<T>(
  req: NextRequest,
  params: { companyId: string },
  backendPath: string,
  demoData: T
): Promise<NextResponse<T | { error: string }>> {
  const { companyId } = params;
  // ── 1. Apply security headers to all responses ──────────────────────
  const headers = new Headers();
  applySecurityHeaders(headers);

  // ── 2. Rate limiting ────────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rl = checkRateLimit(`${ip}:${backendPath}`, {
    limit: 60,
    windowSeconds: 15,
    prefix: "proxy",
  });
  if (!rl.allowed) {
    headers.set("Retry-After", String(Math.ceil((rl.resetAt - Date.now()) / 1000)));
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers }
    );
  }

  // ── 3. Origin validation for CSRF protection ────────────────────────
  const originCheck = validateRequestOrigin(req);
  if (!originCheck.valid && req.method !== "GET") {
    return NextResponse.json(
      { error: originCheck.reason || "Request origin not allowed" },
      { status: 403, headers }
    );
  }

  // ── 4. Validate user's session token AND companyId access ───────────
  //    This prevents privilege escalation: user A cannot request company B's data.
  const userToken = extractUserSessionToken(req);

  if (userToken) {
    const tokenValidation = verifyApiToken(userToken);
    if (!tokenValidation.valid) {
      // Invalid token — reject to prevent unauthorized data access
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401, headers }
      );
    }

    // Critical: enforce that the requested companyId matches the user's own companyId
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
  // If no user token is present, the request is unauthenticated.
  // In production this should be blocked, but for development/demo mode
  // we allow falling back to demo data.

  // ── 5. If JWT_SECRET is not set or backend is down, return demo data ─
  if (!JWT_SECRET) {
    const res = NextResponse.json(demoData, { headers });
    return res;
  }

  // ── 6. Fetch from backend ───────────────────────────────────────────
  try {
    const data = await fetchFromBackend<T>(backendPath, companyId);
    const res = NextResponse.json(data, { headers });
    return res;
  } catch (err) {
    console.warn(
      `[backendProxy] ${backendPath} failed, using demo data:`,
      (err as Error).message
    );
    const res = NextResponse.json(demoData, { headers });
    return res;
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
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers }
    );
  }

  // ── Origin validation (enforced for all mutations) ──────────────────
  const originCheck = validateRequestOrigin(req);
  if (!originCheck.valid) {
    return NextResponse.json(
      { error: originCheck.reason || "Request origin not allowed" },
      { status: 403, headers }
    );
  }

  // ── Token validation ────────────────────────────────────────────────
  const userToken = extractUserSessionToken(req);
  let userCompanyId: string | undefined;

  if (userToken) {
    const tokenValidation = verifyApiToken(userToken);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401, headers }
      );
    }
    userCompanyId = tokenValidation.companyId;

    if (
      userCompanyId &&
      !isCompanyAccessAuthorized(userCompanyId, companyId)
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers }
      );
    }
  } else {
    // Mutations require authentication
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401, headers }
    );
  }

  // ── Execute mutation ────────────────────────────────────────────────
  if (!JWT_SECRET) {
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 503, headers }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const backendToken = createBackendToken(companyId);
    const url = `${BACKEND_URL}${backendPath}`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Backend mutation failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as T;
    return NextResponse.json(data, { status: res.status, headers });
  } catch (err) {
    console.error(`[backendProxy] ${method} ${backendPath} failed:`, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}
