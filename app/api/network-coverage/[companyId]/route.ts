import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { NETWORK_COVERAGE_DEMO } from "@/lib/data/networkCoverageDemo";
import type { NetworkCoverageReport } from "@/lib/types/networkCoverage";

/**
 * GET /api/network-coverage/:companyId
 *
 * Proxies to the backend's /network-coverage/:companyId. An authenticated
 * caller gets live data or a loud 502 - never the fixture.
 *
 * The report states which economic questions are answerable and, for the rest,
 * which layer is missing. The backend computes that from the connected
 * integrations; it does not interpolate a missing layer, so an uncovered layer
 * surfaces as a blocker rather than as a thinner answer.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<NetworkCoverageReport>(
    req,
    p,
    `/network-coverage/${p.companyId}`,
    NETWORK_COVERAGE_DEMO
  );
}
