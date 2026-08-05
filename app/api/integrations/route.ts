import { NextRequest, NextResponse } from "next/server";
import { handleApiGet } from "../../../lib/backendProxy";

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
    {} // demo data (empty — frontend uses hardcoded defaults)
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

    return NextResponse.json(
      { error: `Provider "${provider}" does not support token-based connection` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Integration connect failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
