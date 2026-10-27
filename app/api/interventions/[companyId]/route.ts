import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { INTERVENTIONS_DEMO_LIST } from "@/lib/data/interventionsDemo";
import type { InterventionListResponse } from "@/lib/types/interventions";

/**
 * GET /api/interventions/:companyId
 *
 * Proxies to the backend's /interventions/:companyId. An authenticated caller
 * gets live data or a loud 502 - never the fixture. The fixture is only served
 * to unauthenticated previews, labelled X-Ledgera-Data-Source: demo.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<InterventionListResponse>(
    req,
    p,
    `/interventions/${p.companyId}/interventions`,
    INTERVENTIONS_DEMO_LIST
  );
}
