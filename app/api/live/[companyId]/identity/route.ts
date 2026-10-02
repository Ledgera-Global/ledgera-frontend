import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { LIVE_IDENTITY_RESPONSE_DEMO } from "@/lib/data/liveDemo";
import type { IdentityResponse } from "@/lib/types/live";

/**
 * GET /api/live/:companyId/identity
 *
 * Proxies to the backend's /live/:companyId/identity. Authenticated callers get
 * live data or a loud 502 - never the fixture. The fixture is only served to
 * unauthenticated previews, labelled with X-Ledgera-Data-Source: demo.
 *
 * `refresh` is forwarded verbatim. It is the explicit "I just changed something"
 * signal, and the backend charges for it by recomputing from the database
 * instead of returning its cached copy.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  const refresh = req.nextUrl.searchParams.get("refresh") === "true";
  const suffix = refresh ? "?refresh=true" : "";

  return handleApiGet<IdentityResponse>(
    req,
    p,
    `/live/${p.companyId}/identity${suffix}`,
    LIVE_IDENTITY_RESPONSE_DEMO
  );
}
