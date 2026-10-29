import { NextRequest } from "next/server";
import { handleApiGet, handleApiMutation } from "@/lib/backendProxy";
import { ASSURANCE_CASES_DEMO } from "@/lib/data/assuranceCasesDemo";

import type {
  AssuranceCaseListResponse,
  AssuranceSyncResult,
} from "@/lib/types/assuranceCases";

/**
 * GET  /api/assurance-cases/:companyId          → the working list
 * POST /api/assurance-cases/:companyId          → run the assurance pass, persist findings
 *
 * Both go through the shared proxy, so the same rules apply as everywhere else:
 * an authenticated caller gets live data or a loud 502, never the fixture, and
 * the fixture is served only to an unauthenticated preview under an
 * `X-Ledgera-Data-Source: demo` header.
 *
 * Sync is a POST because it writes. It re-runs the engines and refreshes the
 * cases; it never overwrites an owner, a due date or a resolution, because a
 * background refresh that reopened a closed case would destroy the record.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<AssuranceCaseListResponse>(
    req,
    p,
    `/assurance-cases/${p.companyId}/cases`,
    ASSURANCE_CASES_DEMO
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiMutation<AssuranceSyncResult>(
    req,
    p,
    `/assurance-cases/${p.companyId}/cases/sync`,
    "POST"
  );
}
