import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { EXIT_READINESS_DEMO } from "@/lib/data/exitReadinessDemo";
import type { ExitReadiness } from "@/lib/types/exitReadiness";

/**
 * GET /api/exit-readiness/:companyId
 *
 * Proxies to the backend's /exit-readiness/:companyId. Authenticated callers get
 * live data or a loud 502 - never the fixture. The fixture is only served to
 * unauthenticated previews, labelled with X-Ledgera-Data-Source: demo.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<ExitReadiness>(
    req,
    p,
    `/exit-readiness/${p.companyId}`,
    EXIT_READINESS_DEMO
  );
}
