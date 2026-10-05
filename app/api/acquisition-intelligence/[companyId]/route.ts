import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { ACQUISITION_INTELLIGENCE_DEMO } from "@/lib/data/acquisitionIntelligenceDemo";
import type { AcquisitionPortfolio } from "@/lib/types/acquisitionIntelligence";

/**
 * GET /api/acquisition-intelligence/:companyId
 *
 * Proxies to the backend's /acquisition-intelligence/:companyId.
 *
 * Authenticated callers get live data or a loud 502 — never the fixture. The
 * fixture is served only to unauthenticated previews, and is labelled
 * X-Ledgera-Data-Source: demo so it can never be mistaken for a real portfolio.
 * That distinction matters more here than on most surfaces: post-close deal
 * performance is exactly the kind of figure an owner might act on.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<AcquisitionPortfolio>(
    req,
    p,
    `/acquisition-intelligence/${p.companyId}`,
    ACQUISITION_INTELLIGENCE_DEMO
  );
}
