import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { LIVE_EVENTS_DEMO } from "@/lib/data/liveDemo";
import type { EventsResponse } from "@/lib/types/live";

/**
 * GET /api/live/:companyId/events
 *
 * Proxies to the backend's /live/:companyId/events. Newest first, one list for
 * every kind of material change: a cleared payment, a completed job, a renewed
 * policy and a failed sync all arrive in the same shape.
 *
 * `limit` is forwarded; the backend clamps it, so a caller asking for a million
 * rows gets the clamp rather than an error.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  const limit = req.nextUrl.searchParams.get("limit");
  const suffix = limit ? `?limit=${encodeURIComponent(limit)}` : "";

  return handleApiGet<EventsResponse>(
    req,
    p,
    `/live/${p.companyId}/events${suffix}`,
    { companyId: p.companyId, events: LIVE_EVENTS_DEMO }
  );
}
