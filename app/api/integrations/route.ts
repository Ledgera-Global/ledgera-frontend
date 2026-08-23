import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { handleApiGet } from "../../../lib/backendProxy";

/**
 * Sign a backend JWT with the shared JWT_SECRET. The Express backend's auth
 * middleware reads `sub`/`companyId` as the tenant, matching backendProxy.
 */
function createBackendToken(companyId: string): string {
  return jwt.sign(
    { sub: companyId, companyId, userId: `ui-${companyId}`, email: "ui@ledgera.local", role: "admin" },
    process.env.JWT_SECRET || "",
    { algorithm: "HS256", expiresIn: "5m" }
  );
}

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

/**
 * GET /api/integrations
 *
 * Proxies to the Express backend to get real integration connection statuses
 * for the authenticated user's company.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const companyId = request.nextUrl.searchParams.get("companyId") || "companyA";
  const awaitedParams = await params;

  return handleApiGet<Record<string, string>>(
    request,
    { companyId, ...awaitedParams },
    `/integrations/status/${companyId}`,
    {} // demo data (empty - frontend uses hardcoded defaults)
  );
}

/**
 * POST /api/integrations
 *
 * Used by API-token-based providers (e.g. Samsara) to store credentials.
 * Body: { provider, companyId, apiToken }
 * Proxies to the backend's connect endpoint.
 */
export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { provider, companyId, apiToken } = body;

    if (!provider || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields: provider, companyId" },
        { status: 400 }
      );
    }

    if (provider === "samsara") {
      if (!apiToken) {
        return NextResponse.json(
          { error: "apiToken is required for Samsara" },
          { status: 400 }
        );
      }

      // Proxy to backend's Samsara connect endpoint
      const backendUrl = `${BACKEND_URL}/integrations/${companyId}/samsara/connect`;

      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({ apiToken }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend connect failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (provider === "callrail") {
      const { accountId } = body;
      if (!apiToken || !accountId) {
        return NextResponse.json(
          { error: "apiToken and accountId are required for CallRail" },
          { status: 400 }
        );
      }

      const backendUrl = `${BACKEND_URL}/integrations/${companyId}/callrail/connect`;
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({ apiToken, accountId }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend connect failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (provider === "google-ads") {
      const { customerId } = body;
      if (!apiToken || !customerId) {
        return NextResponse.json(
          { error: "apiToken and customerId are required for Google Ads" },
          { status: 400 }
        );
      }

      const backendUrl = `${BACKEND_URL}/integrations/${companyId}/google-ads/connect`;
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({ apiToken, customerId }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend connect failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (provider === "meta-ads") {
      const { adAccountId } = body;
      if (!apiToken || !adAccountId) {
        return NextResponse.json(
          { error: "apiToken and adAccountId are required for Meta Ads" },
          { status: 400 }
        );
      }

      const backendUrl = `${BACKEND_URL}/integrations/${companyId}/meta-ads/connect`;
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({ apiToken, adAccountId }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend connect failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (provider === "hubspot") {
      if (!apiToken) {
        return NextResponse.json(
          { error: "apiToken is required for HubSpot" },
          { status: 400 }
        );
      }

      const backendUrl = `${BACKEND_URL}/integrations/${companyId}/hubspot/connect`;
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({ apiToken }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend connect failed (${res.status}): ${text}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Generic path: any registry api-token provider connects through the
    // backend's unified token-connect endpoint.
    const { credentials } = body as { credentials?: Record<string, string> };
    if (!credentials || typeof credentials !== "object") {
      return NextResponse.json(
        { error: `Provider "${provider}" does not support token-based connection` },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_URL}/integrations/${companyId}/token-connect`;
    const backendToken = createBackendToken(companyId);
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify({ provider, credentials }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}) as { error?: string });
      return NextResponse.json(
        { error: data.error || `Connection failed (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Integration connect failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
