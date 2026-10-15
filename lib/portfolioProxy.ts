import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "./sessionCookie";

import {
  applySecurityHeaders,
  checkRateLimit,
  isTokenVerifierConfigured,
  verifyApiToken,
} from "./security";

/**
 * Proxy for the portfolio endpoints.
 *
 * WHY THIS IS NOT `handleApiGet`
 *
 * `handleApiGet` is company-scoped: it takes a `companyId`, and once it can
 * decode the caller's token it refuses the request unless the token's company
 * matches. A portfolio is the one object in this product that deliberately
 * spans companies, so there is no single `companyId` that the check could
 * compare against. Reusing that helper would mean either inventing a company to
 * match - authorising the wrong thing - or dropping the check and leaving a
 * helper whose name promises a guarantee it no longer makes.
 *
 * So the portfolio gets its own proxy with its own, weaker, honest promise:
 * the caller must be authenticated, and the backend decides what they may see.
 * `requirePortfolioAccess` resolves the caller's visible company set from real
 * membership rows on every request; nothing in this process decides it, and
 * nothing in this process can widen it.
 *
 * WHY THERE IS NO DEMO FALLBACK
 *
 * Every company-scoped route in this app serves fixtures to unauthenticated
 * callers as a public preview. A portfolio must not. Fabricated fixtures would
 * be several companies' revenue, margin and EBITDA - numbers that read as a
 * real holdings summary. A preview of that is not a preview, it is a made-up
 * balance sheet. Unauthenticated callers get 401 and authenticated callers get
 * either real data or a loud failure; there is no third path.
 */

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 8000;

/** Makes the provenance of every response explicit, as the company proxy does. */
const DATA_SOURCE_HEADER = "X-Ledgera-Data-Source";

export async function handlePortfolioGet<T>(
  req: NextRequest,
  backendPath: string
): Promise<NextResponse> {
  const headers = new Headers();
  applySecurityHeaders(headers);

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rl = checkRateLimit(`${ip}:${backendPath}`, {
    limit: 60,
    windowSeconds: 15,
    prefix: "portfolio-proxy",
  });
  if (!rl.allowed) {
    headers.set("Retry-After", String(Math.ceil((rl.resetAt - Date.now()) / 1000)));
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
  }

  const userToken = readSessionToken(req);
  if (!userToken) {
    // No fixtures here - see the module comment.
    return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });
  }

  // Same pattern as the company proxy: the local signature check only runs when
  // this deployment holds the shared secret. The backend verifies the token
  // against the live user record regardless, and derives membership from it.
  if (isTokenVerifierConfigured()) {
    const tokenValidation = verifyApiToken(userToken);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401, headers }
      );
    }
    // Note deliberately absent: any comparison of the token's companyId to the
    // portfolio. Membership is not in the token and cannot be, so this layer
    // has nothing to compare and must not pretend otherwise.
  }

  try {
    const res = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[portfolioProxy] ${backendPath} -> ${res.status}: ${text}`);
      // 401/403/404 are the backend's own access decisions and are passed
      // through unchanged, so the client can distinguish "not yours" from
      // "the service is down" instead of seeing every failure as a 502.
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        return NextResponse.json(
          { error: "Not available" },
          { status: res.status, headers }
        );
      }
      return NextResponse.json(
        { error: "Portfolio data temporarily unavailable" },
        { status: 502, headers }
      );
    }

    const data = (await res.json()) as T;
    headers.set(DATA_SOURCE_HEADER, "live");
    return NextResponse.json(data, { headers });
  } catch (err) {
    console.error(`[portfolioProxy] ${backendPath} failed:`, (err as Error).message);
    return NextResponse.json(
      { error: "Portfolio data temporarily unavailable" },
      { status: 502, headers }
    );
  }
}
