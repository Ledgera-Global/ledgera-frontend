import { NextRequest, NextResponse } from "next/server";
import { extractUserSessionToken, handleApiGet } from "@/lib/backendProxy";
import { demoAttributionFor } from "@/lib/data/interventionsDemo";
import type { InterventionAttribution } from "@/lib/types/interventions";

/**
 * GET /api/interventions/:companyId/:interventionId/attribution
 *
 * Proxies to the backend's attribution endpoint. The backend computes the
 * bridge from the stored measurement windows and refuses to compute one whose
 * windows overlap - it does not silently widen, clamp or guess them, because a
 * baseline that touches the treated period measures the change against itself.
 *
 * Authenticated callers get live data or a loud 502. The fixture is only for
 * unauthenticated previews and is labelled X-Ledgera-Data-Source: demo, since a
 * preview honestly has no interventions of its own.
 *
 * A preview asking about an intervention that has no fixture is answered with a
 * 404, never with a different intervention's bridge. Substituting one would put
 * one vendor's profit numbers under another vendor's name, which is the exact
 * confusion the demo/provenance split exists to prevent.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; interventionId: string }> }
) {
  const p = await params;
  const demo = demoAttributionFor(p.interventionId);

  if (demo === null && extractUserSessionToken(req) === null) {
    return NextResponse.json(
      { error: "No attribution is recorded for this intervention" },
      { status: 404 }
    );
  }

  return handleApiGet<InterventionAttribution>(
    req,
    p,
    `/interventions/${p.companyId}/interventions/${p.interventionId}/attribution`,
    // Only reached without a session when a fixture exists, and an authenticated
    // call replaces it with the backend's answer or fails loudly, so the
    // placeholder is never served.
    demo ?? ({} as InterventionAttribution)
  );
}
