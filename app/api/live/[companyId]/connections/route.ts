import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { LIVE_CONNECTIONS_DEMO } from "@/lib/data/liveDemo";
import type { ConnectionsResponse } from "@/lib/types/live";

/**
 * GET /api/live/:companyId/connections
 *
 * Proxies to the backend's /live/:companyId/connections: every connected source
 * and how much its data can be trusted right now.
 *
 * The payload carries both `status` (we hold credentials) and
 * `mayPresentAsCurrent` (we are allowed to call the figures current). The page
 * branches on the second; this route exists so it can.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;

  return handleApiGet<ConnectionsResponse>(
    req,
    p,
    `/live/${p.companyId}/connections`,
    { companyId: p.companyId, connections: LIVE_CONNECTIONS_DEMO }
  );
}
